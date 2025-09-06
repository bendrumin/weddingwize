#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️  WeddingWise AI Database Setup');
console.log('');

// Read the schema file
const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 Database Schema Instructions:');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: bddgekliulqsfhinsnpn');
console.log('3. Navigate to "SQL Editor" in the left sidebar');
console.log('4. Click "New Query"');
console.log('5. Copy and paste the following SQL schema:');
console.log('');
console.log('─'.repeat(80));
console.log(schema);
console.log('─'.repeat(80));
console.log('');
console.log('6. Click "Run" to execute the schema');
console.log('');
console.log('✅ After running the schema, you should see these tables created:');
console.log('   - wedding_profiles');
console.log('   - vendors');
console.log('   - budget_allocations');
console.log('   - vendor_matches');
console.log('   - timeline_tasks');
console.log('   - guests');
console.log('   - scraping_jobs');
console.log('   - user_analytics');
console.log('');
console.log('🔐 Security features enabled:');
console.log('   - Row Level Security (RLS) on all user tables');
console.log('   - Policies ensure users can only access their own data');
console.log('   - Vendors table is public for marketplace functionality');
console.log('');
console.log('🚀 Next: Run "npm run dev" to start the development server!');
