#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌈 WeddingWise AI - Gender-Neutral Schema Update');
console.log('');

// Read the update script
const updatePath = path.join(process.cwd(), 'update-schema-gender-neutral.sql');
const updateScript = fs.readFileSync(updatePath, 'utf8');

console.log('📋 Schema Update Instructions:');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: bddgekliulqsfhinsnpn');
console.log('3. Navigate to "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the following ALTER TABLE script:');
console.log('');
console.log('─'.repeat(80));
console.log(updateScript);
console.log('─'.repeat(80));
console.log('');
console.log('6. Click "Run" to execute the schema update');
console.log('');
console.log('✅ This will update your existing tables:');
console.log('   - bride_name → partner1_name');
console.log('   - groom_name → partner2_name');
console.log('');
console.log('🔍 After running, verify the changes with the SELECT query at the end');
console.log('');
console.log('🚀 Your app will now be fully gender-inclusive!');
