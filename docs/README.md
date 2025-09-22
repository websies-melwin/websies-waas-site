# Websies Website-as-a-Service

## Overview

Websies is a subscription-based website service that delivers professional websites within 7 days at £47/month. The platform supports multiple currencies (GBP/EUR/VND), languages (EN/VI), and includes a referral program with 100% first-month commissions.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=https://websies.co
```

## Project Structure

```
websies-website-2/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   ├── api/               # API endpoints
│   └── auth/              # Auth callbacks
├── components/            # React components
│   ├── ui/               # Design system
│   └── analytics/        # Analytics components
├── lib/                  # Utilities
│   ├── supabase/        # Database client
│   ├── stripe/          # Payment processing
│   └── analytics/       # Analytics helpers
├── public/              # Static assets
├── styles/              # Global styles
└── supabase/            # Database migrations
```

## Features

### Core Functionality
- ✅ Multi-language support (EN/VI)
- ✅ Multi-currency pricing (GBP/EUR/VND)
- ✅ Subscription management via Stripe
- ✅ Referral program with tracking
- ✅ Client portal with dashboard
- ✅ Privacy-focused analytics
- ✅ Role-based access control

### Security Features
- Row Level Security (RLS) on all tables
- CSRF protection on sensitive routes
- Rate limiting on API endpoints
- Secure session management
- Content Security Policy (CSP)

## Development

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Seed database
supabase db seed
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm test
```

### Deployment

```bash
# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /auth/callback` - OAuth callback

### Subscriptions
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhooks` - Handle Stripe events
- `GET /api/stripe/customer` - Get customer details

### Analytics
- `POST /api/analytics/collect` - Track events
- `GET /api/analytics/dashboard` - Get dashboard data

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

Proprietary - Websies © 2024