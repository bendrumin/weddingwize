# Supabase Setup Guide for WeddingWise AI

## 🚀 Connecting to Your Existing Supabase Project

### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your existing project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### Step 2: Update Environment Variables

Create or update your `.env.local` file with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other API keys (add as needed)
OPENAI_API_KEY=your-openai-api-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
RESEND_API_KEY=your-resend-api-key
```

### Step 3: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste and run the SQL script to create all tables and policies

### Step 4: Verify Database Setup

After running the schema, you should see these tables in your **Table Editor**:
- `wedding_profiles`
- `vendors`
- `budget_allocations`
- `vendor_matches`
- `timeline_tasks`
- `guests`
- `scraping_jobs`
- `user_analytics`

### Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try signing up for a new account
4. Check your Supabase **Authentication** tab to see the new user
5. Check the `wedding_profiles` table to see the created profile

## 🔧 Database Schema Overview

The schema includes:

### Core Tables
- **wedding_profiles**: User wedding information and preferences
- **vendors**: Marketplace vendor data (public, no RLS)
- **budget_allocations**: AI-optimized budget tracking
- **vendor_matches**: User-vendor compatibility scores
- **timeline_tasks**: Wedding planning timeline with dependencies
- **guests**: Guest management and RSVP tracking

### Analytics & Admin
- **scraping_jobs**: Vendor data scraping status
- **user_analytics**: User behavior tracking

### Security Features
- Row Level Security (RLS) enabled on all user tables
- Policies ensure users can only access their own data
- Vendors table is public for marketplace functionality

## 🚀 Next Steps

Once your Supabase connection is working:

1. **Test Authentication**: Sign up and sign in to verify the flow
2. **Check Dashboard**: Ensure the dashboard loads with user data
3. **Verify RLS**: Confirm users can only see their own data
4. **Deploy to Vercel**: Connect your GitHub repo to Vercel for production

## 🔍 Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your Supabase URL and keys
2. **"RLS policy violation"**: Ensure RLS policies are properly set up
3. **"Table doesn't exist"**: Make sure you ran the complete schema
4. **CORS errors**: Check your Supabase project settings

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- Check the project's GitHub Issues for common problems

---

**Ready to build the most intelligent wedding planning platform! 💕**
