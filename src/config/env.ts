// Environment configuration for WeddingWise AI

export const env = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  
  // Stripe
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  
  // Email
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
  },
  
  // Analytics
  posthog: {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  // Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN!,
  },
  
  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
} as const;

// Validation function to check required environment variables
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Environment-specific configurations
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
