/**
 * API Authentication Middleware
 * 
 * Utilities for protecting API routes with Firebase authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken, getUserProfile } from './firebase-admin'

export type AuthenticatedUser = {
  uid: string
  email: string | undefined
  role: string
  schoolId: string
  displayName: string
}

/**
 * Extract Bearer token from Authorization header
 * 
 * @param request - Next.js request object
 * @returns ID token string or null
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader) {
    return null
  }
  
  // Format: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Verify authentication and return user data
 * 
 * @param request - Next.js request object
 * @returns Authenticated user data
 * @throws Error if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser> {
  // Extract token from header
  const idToken = extractBearerToken(request)
  
  if (!idToken) {
    throw new Error('Missing Authorization header. Please include "Bearer <token>"')
  }
  
  try {
    // Verify token with Firebase Admin
    const decodedToken = await verifyIdToken(idToken)
    
    // Get full user profile from Firestore
    const profile = await getUserProfile(decodedToken.uid)
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: profile?.role || 'Student',
      schoolId: profile?.schoolId || '',
      displayName: profile?.displayName || 'User',
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
    throw new Error('Authentication failed')
  }
}

/**
 * Middleware wrapper for authenticated API routes
 * 
 * @param handler - Your API route handler function
 * @returns Protected API route handler
 * 
 * @example
 * export const POST = withAuth(async (req, user) => {
 *   // user is guaranteed to be authenticated here
 *   console.log('User:', user.uid, user.role)
 *   // ... your logic
 * })
 */
export function withAuth(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest) => {
    try {
      const user = await authenticateRequest(request)
      return await handler(request, user)
    } catch (error) {
      console.error('API Authentication Error:', error)
      
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }
  }
}

/**
 * Simple in-memory rate limiter
 * Limits requests per IP address
 * 
 * For production, use Redis or a dedicated rate limiting service
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 20, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if a request should be allowed
   * 
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const record = this.requests.get(identifier)

    // No record or window expired → allow and create new record
    if (!record || now > record.resetAt) {
      this.requests.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
      }
    }

    // Within window → check count
    if (record.count < this.maxRequests) {
      record.count++
      return {
        allowed: true,
        remaining: this.maxRequests - record.count,
        resetAt: record.resetAt,
      }
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  /**
   * Clean up expired records (call periodically)
   */
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(key)
      }
    }
  }
}

// Global rate limiter instance
// 10 requests per minute per user (Stricter limit for AI chat)
export const chatRateLimiter = new RateLimiter(10, 60000)

// Cleanup expired records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => chatRateLimiter.cleanup(), 5 * 60 * 1000)
}

/**
 * Middleware wrapper with rate limiting
 * 
 * @param handler - Your API route handler
 * @param rateLimiter - Rate limiter instance
 * @returns Protected API route handler with rate limiting
 */
export function withAuthAndRateLimit(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse> | NextResponse,
  rateLimiter: RateLimiter = chatRateLimiter
) {
  return withAuth(async (request, user) => {
    // Rate limit by user ID
    const rateLimitResult = rateLimiter.check(user.uid)

    if (!rateLimitResult.allowed) {
      const resetDate = new Date(rateLimitResult.resetAt)
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          resetAt: resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': chatRateLimiter['maxRequests'].toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt / 1000).toString(),
          },
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(request, user)
    response.headers.set('X-RateLimit-Limit', chatRateLimiter['maxRequests'].toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.floor(rateLimitResult.resetAt / 1000).toString())

    return response
  })
}
