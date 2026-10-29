"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth"
import {
  doc, getDoc, setDoc, updateDoc, increment, serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { type UserRole } from "@/app/constants"
import { type Tier } from "@/lib/school-codes"
import { getTierFromClass } from "@/lib/school-codes"

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  role: UserRole
  schoolId: string
  schoolName: string
  classNum: number       // 1-12
  section: string        // "A", "B", "C", "D"
  tier: Tier             // "primary" | "secondary" (auto-derived from classNum)
  totalXP: number        // Accumulated XP from homework
  currentModuleOrder: number // Current module sequence number
  parentPhone?: string   // Emergency SMS contact for student parents
}

type SignupParams = {
  email: string
  password: string
  displayName: string
  role: UserRole
  schoolId: string
  schoolName: string
  classNum: number
  section: string
  schoolCode: string
  parentPhone?: string
}

type AuthContextType = {
  user: FirebaseUser | null
  profile: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  logout: () => Promise<void>
  addXP: (amount: number) => Promise<void>
  resetProfileXP: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Deprecated: School XP is now aggregated from Firestore user profiles.
// export function addSchoolXP(schoolId: string, amount: number) {}
// export function getSchoolXP(schoolId: string): number { return 0; }

export function resetAllScores(profile?: UserProfile | null) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("suraksha_learning_progress")
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("school_xp_") || key.startsWith("user_profile_")) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn("Failed to reset scores:", e)
    }
  }
}

const ADMIN_EMAILS = ["ashcr2004@gmail.com"]

export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

function ensureAdminProfile(p: UserProfile): UserProfile {
  if (checkIsAdminEmail(p.email)) {
    return {
      ...p,
      role: "Administrator",
      schoolId: "admin-system",
      schoolName: "System Admin",
    }
  }
  return p
}

function saveLocalProfile(profile: UserProfile) {
  if (typeof window !== "undefined") {
    try {
      const updated = ensureAdminProfile(profile)
      localStorage.setItem(`user_profile_${updated.uid}`, JSON.stringify(updated))
    } catch (err) {
      console.warn("Failed to save profile to localStorage:", err)
    }
  }
}

function getLocalProfile(uid: string): UserProfile | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(`user_profile_${uid}`)
      if (data) return ensureAdminProfile(JSON.parse(data) as UserProfile)
    } catch (err) {
      console.warn("Failed to read profile from localStorage:", err)
    }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Listen to auth state — optimistic: show cached profile instantly, sync from Firestore in background
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // OPTIMISTIC: Show cached profile immediately to avoid loading delay
        const cachedProfile = getLocalProfile(firebaseUser.uid)
        if (cachedProfile) {
          setProfile(cachedProfile)
          setLoading(false) // Unblock UI immediately with cached data
        }

        // BACKGROUND: Sync latest from Firestore
        try {
          const docRef = doc(db, "users", firebaseUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const rawData = docSnap.data() as UserProfile
            const data = ensureAdminProfile(rawData)
            
            // If admin email but Firestore role is wrong, fix it in Firestore
            if (checkIsAdminEmail(data.email) && rawData.role !== "Administrator") {
              try {
                await updateDoc(docRef, {
                  role: "Administrator",
                  schoolId: "admin-system",
                  schoolName: "System Admin",
                })
              } catch (e) {
                console.warn("Could not sync admin role to Firestore:", e)
              }
            }
            
            saveLocalProfile(data)
            setProfile(data)
          } else {
            // No Firestore doc — create one for admin users
            const isAdmin = checkIsAdminEmail(firebaseUser.email)
            const local = getLocalProfile(firebaseUser.uid)
            if (local) {
              setProfile(local)
              // If admin, ensure doc exists in Firestore for rules
              if (isAdmin) {
                try {
                  await setDoc(docRef, { ...local, role: "Administrator", schoolId: "admin-system", schoolName: "System Admin", createdAt: serverTimestamp() }, { merge: true })
                } catch (e) {
                  console.warn("Could not create admin Firestore doc:", e)
                }
              }
            } else {
              const fallbackProfile: UserProfile = ensureAdminProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                role: isAdmin ? "Administrator" : "Student",
                schoolId: isAdmin ? "admin-system" : "kv-bengaluru",
                schoolName: isAdmin ? "System Admin" : "Kendriya Vidyalaya, Bengaluru",
                classNum: 5,
                section: "Section A",
                tier: "primary",
                totalXP: 0,
                currentModuleOrder: 1,
              })
              saveLocalProfile(fallbackProfile)
              setProfile(fallbackProfile)
              // Write to Firestore so security rules work
              try {
                await setDoc(docRef, { ...fallbackProfile, createdAt: serverTimestamp() })
              } catch (e) {
                console.warn("Could not create Firestore profile:", e)
              }
            }
          }
        } catch (err) {
          console.warn("Failed to load user profile from Firestore, using local fallback:", err)
          if (!cachedProfile) {
            const local = getLocalProfile(firebaseUser.uid)
            if (local) {
              setProfile(local)
            } else {
              const isAdmin = checkIsAdminEmail(firebaseUser.email)
              const fallbackProfile: UserProfile = ensureAdminProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                role: isAdmin ? "Administrator" : "Student",
                schoolId: isAdmin ? "admin-system" : "kv-bengaluru",
                schoolName: isAdmin ? "System Admin" : "Kendriya Vidyalaya, Bengaluru",
                classNum: 5,
                section: "Section A",
                tier: "primary",
                totalXP: 0,
                currentModuleOrder: 1,
              })
              saveLocalProfile(fallbackProfile)
              setProfile(fallbackProfile)
            }
          }
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    // Use client-side admin check — eliminates a network round-trip
    const isAdmin = checkIsAdminEmail(email)

    const cred = await signInWithEmailAndPassword(auth, email, password)

    // Try to load profile from Firestore
    try {
      const docRef = doc(db, "users", cred.user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile
        if (isAdmin) data.role = "Administrator"
        saveLocalProfile(data)
        setProfile(data)
        return
      }
    } catch (err) {
      console.warn("Failed to read user profile from Firestore during login:", err)
    }

    const local = getLocalProfile(cred.user.uid)
    if (local) {
      if (isAdmin) local.role = "Administrator"
      setProfile(local)
    } else {
      const defaultRole: UserRole = isAdmin ? "Administrator" : "Student"
      const defaultProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email.toLowerCase(),
        displayName: cred.user.displayName || email.split("@")[0] || "User",
        role: defaultRole,
        schoolId: isAdmin ? "admin-system" : "kv-bengaluru",
        schoolName: isAdmin ? "System Admin" : "Kendriya Vidyalaya, Bengaluru",
        classNum: 5,
        section: "Section A",
        tier: "primary",
        totalXP: 0,
        currentModuleOrder: 1,
      }
      saveLocalProfile(defaultProfile)
      setProfile(defaultProfile)
    }
  }

  const signup = async (params: SignupParams) => {
    const {
      email, password, displayName, role, schoolId, schoolName,
      classNum, section, schoolCode, parentPhone,
    } = params

    // Parallelize admin check + school code validation (saves ~200-400ms)
    const [adminCheckResponse, codeValidationResponse] = await Promise.all([
      fetch('/api/check-admin-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
      fetch('/api/validate-school-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, role, code: schoolCode }),
      }),
    ])

    if (!adminCheckResponse.ok) {
      throw new Error('Failed to verify admin status. Please try again.')
    }
    
    const { isAdmin } = await adminCheckResponse.json()
    const finalRole: UserRole = isAdmin ? "Administrator" : role

    // Validate school code (admin bypasses)
    if (!isAdmin) {
      if (!codeValidationResponse.ok) {
        throw new Error('Failed to validate school code. Please try again.')
      }

      const validation = await codeValidationResponse.json()
      if (!validation.valid) {
        throw new Error(validation.error || "Invalid school verification code.")
      }
    }

    // Determine tier from class
    const tier = getTierFromClass(classNum)

    // Create Firebase Auth account
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: email.toLowerCase(),
      displayName,
      role: finalRole,
      schoolId,
      schoolName,
      classNum,
      section,
      tier,
      totalXP: 0,
      currentModuleOrder: 1,
      ...(parentPhone ? { parentPhone } : {}),
    }

    // Cache profile locally immediately
    saveLocalProfile(userProfile)

    // Write to Firestore safely
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
      })
    } catch (err: any) {
      console.warn("Firestore profile write notice (proceeding with local session):", err?.message || err)
    }

    setProfile(userProfile)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setProfile(null)
  }

  const addXP = async (amount: number) => {
    if (!profile) return
    const updatedXP = (profile.totalXP || 0) + amount
    const updatedProfile: UserProfile = { ...profile, totalXP: updatedXP }
    setProfile(updatedProfile)
    saveLocalProfile(updatedProfile)

    try {
      const docRef = doc(db, "users", profile.uid)
      await updateDoc(docRef, { totalXP: increment(amount) })
    } catch (err) {
      console.warn("Firestore totalXP update notice:", err)
    }
  }

  const resetProfileXP = async () => {
    resetAllScores(profile)
    if (profile) {
      const resetProf: UserProfile = { ...profile, totalXP: 0 }
      setProfile(resetProf)
      saveLocalProfile(resetProf)
      try {
        const docRef = doc(db, "users", profile.uid)
        await updateDoc(docRef, { totalXP: 0 })
      } catch (err) {
        console.warn("Firestore reset totalXP notice:", err)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, addXP, resetProfileXP }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Backward-compatible hook for existing components
export function useUserRole() {
  const { profile } = useAuth()
  return {
    userRole: (profile?.role || "Student") as UserRole,
    setUserRole: () => {}, // no-op — role comes from Firestore now
  }
}
