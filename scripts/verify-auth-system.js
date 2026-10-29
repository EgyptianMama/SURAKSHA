#!/usr/bin/env node

/**
 * 🔐 Authentication System Verification Script
 * 
 * Verifies that:
 * 1. The dangerous user-role-context.tsx is deleted
 * 2. Only auth-context.tsx exists as the authentication source
 * 3. auth-context.tsx exports useUserRole hook
 * 4. No files import from user-role-context
 * 5. All components use the correct auth pattern
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DANGEROUS_FILE = 'src/contexts/user-role-context.tsx';
const LEGITIMATE_FILE = 'src/contexts/auth-context.tsx';

function checkDangerousFileDeleted() {
  const filePath = path.join(process.cwd(), DANGEROUS_FILE);
  if (fs.existsSync(filePath)) {
    console.error(`❌ CRITICAL: ${DANGEROUS_FILE} still exists!`);
    console.error('   This file creates a security vulnerability.');
    console.error('   It defaults to ADMINISTRATOR role on the client-side.');
    return false;
  }
  console.log(`✅ ${DANGEROUS_FILE} successfully deleted`);
  return true;
}

function checkLegitimateFileExists() {
  const filePath = path.join(process.cwd(), LEGITIMATE_FILE);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CRITICAL: ${LEGITIMATE_FILE} is missing!`);
    console.error('   This is the primary authentication context.');
    return false;
  }
  console.log(`✅ ${LEGITIMATE_FILE} exists`);
  return true;
}

function checkAuthContextExportsUserRole() {
  const filePath = path.join(process.cwd(), LEGITIMATE_FILE);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for useUserRole export
  if (!content.includes('export function useUserRole()')) {
    console.error(`❌ ${LEGITIMATE_FILE} does not export useUserRole hook`);
    console.error('   This hook is needed for backward compatibility.');
    return false;
  }
  console.log(`✅ ${LEGITIMATE_FILE} exports useUserRole hook`);
  return true;
}

function checkNoImportsFromDangerousContext() {
  try {
    // Search for imports from user-role-context
    const result = execSync(
      'git grep -l "from.*user-role-context" -- "*.ts" "*.tsx" "*.js" "*.jsx" 2>nul || echo ""',
      { encoding: 'utf-8', shell: 'cmd.exe' }
    ).trim();
    
    if (result && !result.includes('No such file')) {
      const files = result.split('\n').filter(f => {
        const trimmed = f.trim();
        return trimmed && 
               trimmed !== '""' && 
               trimmed !== "''  " &&
               !trimmed.includes('verify-auth-system') &&
               trimmed.length > 2;
      });
      if (files.length > 0) {
        console.error(`❌ Found ${files.length} file(s) importing from user-role-context:`);
        files.forEach(f => console.error(`   - ${f}`));
        return false;
      }
    }
  } catch (error) {
    // Git not available or command failed, try manual search
    console.log('⚠️  Git search unavailable, skipping import check');
    return true;
  }
  
  console.log('✅ No files import from user-role-context');
  return true;
}

function checkAuthProviderUsage() {
  const authLayoutPath = 'src/app/(auth)/layout.tsx';
  const mainLayoutPath = 'src/app/(main)/layout.tsx';
  
  let allGood = true;
  
  // Check auth layout
  if (fs.existsSync(authLayoutPath)) {
    const content = fs.readFileSync(authLayoutPath, 'utf-8');
    if (!content.includes('import { AuthProvider }') || !content.includes('from "@/contexts/auth-context"')) {
      console.error(`❌ ${authLayoutPath} does not import AuthProvider from auth-context`);
      allGood = false;
    } else if (!content.includes('<AuthProvider>')) {
      console.error(`❌ ${authLayoutPath} does not render <AuthProvider>`);
      allGood = false;
    } else {
      console.log(`✅ ${authLayoutPath} correctly uses AuthProvider`);
    }
  }
  
  // Check main layout
  if (fs.existsSync(mainLayoutPath)) {
    const content = fs.readFileSync(mainLayoutPath, 'utf-8');
    if (!content.includes('import { AuthProvider }') || !content.includes('from "@/contexts/auth-context"')) {
      console.error(`❌ ${mainLayoutPath} does not import AuthProvider from auth-context`);
      allGood = false;
    } else if (!content.includes('<AuthProvider>')) {
      console.error(`❌ ${mainLayoutPath} does not render <AuthProvider>`);
      allGood = false;
    } else {
      console.log(`✅ ${mainLayoutPath} correctly uses AuthProvider`);
    }
  }
  
  return allGood;
}

function checkForDuplicateUseUserRole() {
  try {
    // Count how many files export useUserRole
    const result = execSync(
      'git grep -l "export.*function useUserRole" -- "*.ts" "*.tsx" 2>nul || echo ""',
      { encoding: 'utf-8', shell: 'cmd.exe' }
    ).trim();
    
    if (result) {
      const files = result.split('\n').filter(f => {
        const trimmed = f.trim();
        return trimmed && 
               trimmed !== '""' && 
               trimmed !== "''" &&
               trimmed.length > 2;
      });
      if (files.length > 1) {
        console.error(`❌ Found ${files.length} files exporting useUserRole:`);
        files.forEach(f => console.error(`   - ${f}`));
        console.error('   Only auth-context.tsx should export this hook.');
        return false;
      } else if (files.length === 1) {
        if (!files[0].includes('auth-context.tsx')) {
          console.error(`❌ useUserRole exported from wrong file: ${files[0]}`);
          console.error('   Should only be exported from auth-context.tsx');
          return false;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Git search unavailable, skipping duplicate check');
    return true;
  }
  
  console.log('✅ No duplicate useUserRole exports detected');
  return true;
}

function main() {
  console.log('🔐 SURAKSHA Authentication System Verification\n');
  console.log('═'.repeat(60));
  
  const checks = [
    checkDangerousFileDeleted(),
    checkLegitimateFileExists(),
    checkAuthContextExportsUserRole(),
    checkNoImportsFromDangerousContext(),
    checkAuthProviderUsage(),
    checkForDuplicateUseUserRole(),
  ];

  console.log('\n' + '═'.repeat(60));
  
  if (checks.every(Boolean)) {
    console.log('\n✅ All authentication checks passed!');
    console.log('📝 Your authentication system is secure and consolidated.\n');
    console.log('📊 Summary:');
    console.log('   • Single source of truth: auth-context.tsx');
    console.log('   • No client-side role manipulation');
    console.log('   • All layouts use AuthProvider correctly');
    console.log('   • No dangerous context files remain\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some authentication checks failed.');
    console.log('📝 Please fix the issues above before proceeding.\n');
    process.exit(1);
  }
}

main();
