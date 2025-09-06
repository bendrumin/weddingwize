#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 WeddingWise AI - Fix RLS Policy');
console.log('');

// Read the fix script
const fixPath = path.join(process.cwd(), 'fix-rls-policy.sql');
const fixScript = fs.readFileSync(fixPath, 'utf8');

console.log('📋 RLS Policy Fix Instructions:');
console.log('');
console.log('🚨 ISSUE: Row Level Security policy is blocking user signup');
console.log('💡 SOLUTION: Update the RLS policy to allow profile creation');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: bddgekliulqsfhinsnpn');
console.log('3. Navigate to "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the following RLS fix script:');
console.log('');
console.log('─'.repeat(80));
console.log(fixScript);
console.log('─'.repeat(80));
console.log('');
console.log('6. Click "Run" to execute the RLS policy fix');
console.log('');
console.log('✅ This will fix the signup issue by:');
console.log('   - Dropping the old restrictive policy');
console.log('   - Creating a new policy that allows INSERT operations');
console.log('   - Maintaining security by ensuring users can only access their own data');
console.log('');
console.log('🔍 After running, try signing up again - it should work!');
console.log('');
console.log('🚀 Your app will now allow new user registrations!');
