#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎉 Welcome to WeddingWise AI Setup!');
console.log('');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Supabase Configuration (Replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring
SENTRY_DSN=your-sentry-dsn

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created');
}

console.log('');
console.log('🚀 Next steps:');
console.log('1. Update .env.local with your actual API keys');
console.log('2. Set up your Supabase project and run the schema from supabase-schema.sql');
console.log('3. Run "npm run dev" to start the development server');
console.log('');
console.log('📚 For detailed setup instructions, see README.md');
console.log('');
console.log('Happy coding! 💕');
