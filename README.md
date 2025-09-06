# WeddingWise AI - Intelligent Wedding Planning Platform

The most intelligent wedding planning platform that combines real-time vendor data with AI optimization to create the perfect wedding experience.

## 🚀 Features

- **AI-Powered Budget Optimizer** - Intelligent budget allocation based on real market data
- **Smart Vendor Matching** - Advanced matching algorithm using scraped vendor data
- **Dynamic Timeline Management** - Self-adjusting timeline with dependency handling
- **Real-Time Vendor Data** - Constantly updated vendor information and pricing
- **Guest Management Suite** - Intelligent guest management with RSVP tracking
- **AI-Powered Insights** - Personalized recommendations and optimization suggestions

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Supabase (database + auth + storage + real-time)
- **AI**: OpenAI GPT-4 (strategic use for high-value features)
- **Payments**: Stripe (subscriptions + marketplace fees)
- **Email**: Resend + React Email templates
- **Analytics**: PostHog (user behavior) + custom conversion tracking
- **Hosting**: Vercel + Supabase
- **Monitoring**: Sentry + Uptime monitoring

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)
- Resend account (for emails)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd weddingwize
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring
SENTRY_DSN=your_sentry_dsn

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies as defined in the schema

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── contexts/              # React contexts (Auth, etc.)
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client configuration
├── types/                 # TypeScript type definitions
└── config/                # Configuration files
```

## 🎯 Core Features Implementation

### 1. Authentication System
- Supabase Auth integration
- User registration with wedding profile creation
- Protected routes and session management
- Password reset functionality

### 2. Wedding Profile Management
- Complete wedding profile with couple information
- Budget and guest count tracking
- Location and style preferences
- Planning stage progression

### 3. Dashboard
- Wedding overview with key metrics
- Quick action cards for main features
- Planning progress tracking
- Responsive design for all devices

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling
- **Component Architecture**: Atomic design principles

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## 📊 Database Schema

The application uses a comprehensive Supabase schema with the following main tables:

- `wedding_profiles` - User wedding information
- `vendors` - Vendor marketplace data
- `budget_allocations` - AI-optimized budget tracking
- `vendor_matches` - User-vendor compatibility scores
- `timeline_tasks` - Wedding planning timeline
- `guests` - Guest management
- `scraping_jobs` - Vendor data scraping status
- `user_analytics` - User behavior tracking

## 🔐 Security

- Row Level Security (RLS) enabled on all user tables
- Environment variables for sensitive data
- Supabase Auth for secure authentication
- Input validation and sanitization
- CORS configuration for API endpoints

## 📈 Analytics & Monitoring

- PostHog for user behavior analytics
- Sentry for error tracking and monitoring
- Custom conversion tracking
- Performance monitoring with Core Web Vitals

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@weddingwise.ai or join our Discord community.

---

**Made with ❤️ for couples everywhere**