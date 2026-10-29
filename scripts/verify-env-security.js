#!/usr/bin/env node

/**
 * 🔐 Environment Security Verification Script
 * 
 * Checks that:
 * 1. .env exists and is readable
 * 2. .env is NOT tracked by git
 * 3. All required env variables are present
 * 4. No placeholder values remain
 * 5. Credentials appear to be properly formatted
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const REQUIRED_VARS = [
  'GROQ_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const PLACEHOLDER_PATTERNS = [
  'your_',
  'example',
  'placeholder',
  'changeme',
  'todo',
  'xxx',
];

// Add any value you have rotated here so the check fails if it ever shows up in .env again.
// (Never put real secrets in this file - it is committed.)
const COMPROMISED_VALUES = [];

function checkEnvExists() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('💡 Copy .env.example to .env and fill in your values');
    return false;
  }
  console.log('✅ .env file exists');
  return true;
}

function checkGitIgnore() {
  try {
    const result = execSync('git ls-files .env', { encoding: 'utf-8' }).trim();
    if (result) {
      console.error('❌ CRITICAL: .env is tracked by git!');
      console.log('💡 Run: git rm --cached .env');
      return false;
    }
    console.log('✅ .env is properly ignored by git');
    return true;
  } catch (error) {
    // Not a git repo or git not available
    console.log('⚠️  Cannot verify git status (not a git repo or git unavailable)');
    return true;
  }
}

function checkEnvVariables() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const envVars = {};
  
  // Parse .env file
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  let allGood = true;

  // Check required variables
  console.log('\n📋 Checking required variables:');
  REQUIRED_VARS.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      console.error(`  ❌ ${varName} is missing or empty`);
      allGood = false;
    } else {
      console.log(`  ✅ ${varName}`);
    }
  });

  // Check for placeholders
  console.log('\n🔍 Checking for placeholder values:');
  let hasPlaceholders = false;
  Object.entries(envVars).forEach(([key, value]) => {
    const lowerValue = value.toLowerCase();
    if (PLACEHOLDER_PATTERNS.some(pattern => lowerValue.includes(pattern))) {
      console.error(`  ❌ ${key} contains placeholder value: ${value}`);
      hasPlaceholders = true;
    }
  });
  if (!hasPlaceholders) {
    console.log('  ✅ No placeholder values detected');
  } else {
    allGood = false;
  }

  // Check for compromised values
  console.log('\n🚨 Checking for compromised credentials:');
  let hasCompromised = false;
  Object.entries(envVars).forEach(([key, value]) => {
    if (COMPROMISED_VALUES.includes(value.trim())) {
      console.error(`  ❌ CRITICAL: ${key} contains a COMPROMISED value!`);
      console.error(`     This credential was exposed and MUST be rotated.`);
      hasCompromised = true;
    }
  });
  if (!hasCompromised) {
    console.log('  ✅ No known compromised values detected');
  } else {
    allGood = false;
    console.log('\n💡 See SECURITY_ROTATION_GUIDE.md for rotation instructions');
  }

  // Format validation
  console.log('\n✏️  Checking credential formats:');
  if (envVars['GROQ_API_KEY'] && !envVars['GROQ_API_KEY'].startsWith('gsk_')) {
    console.warn('  ⚠️  GROQ_API_KEY format looks unusual (expected to start with "gsk_")');
  }
  if (envVars['EMAIL_USER'] && !envVars['EMAIL_USER'].includes('@')) {
    console.error('  ❌ EMAIL_USER should be a valid email address');
    allGood = false;
  }
  if (envVars['EMAIL_PASS'] && envVars['EMAIL_PASS'].length < 10) {
    console.warn('  ⚠️  EMAIL_PASS seems too short (Gmail app passwords are 16 chars)');
  }

  return allGood;
}

function main() {
  console.log('🔐 SURAKSHA Environment Security Check\n');
  console.log('═'.repeat(50));
  
  const checks = [
    checkEnvExists(),
    checkGitIgnore(),
    checkEnvVariables(),
  ];

  console.log('\n' + '═'.repeat(50));
  
  if (checks.every(Boolean)) {
    console.log('\n✅ All security checks passed!');
    console.log('📝 Your environment is properly configured.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some security checks failed.');
    console.log('📝 Please fix the issues above before proceeding.\n');
    process.exit(1);
  }
}

main();
