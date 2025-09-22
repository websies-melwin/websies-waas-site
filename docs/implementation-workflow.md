# Implementation Workflow

## Epic Breakdown

### Epic 1: Authentication & Authorization
- **Story 1.1**: Implement signup with email verification
- **Story 1.2**: Login/logout with session management  
- **Story 1.3**: Password reset flow
- **Story 1.4**: Role-based access (Owner/Admin/Client)
- **Story 1.5**: Protected routes and middleware

### Epic 2: Subscription Management
- **Story 2.1**: Stripe Checkout integration with Price IDs
- **Story 2.2**: Webhook handling for subscription events
- **Story 2.3**: Subscription status tracking in database
- **Story 2.4**: Grace period and dunning management
- **Story 2.5**: Plan upgrade/downgrade flow

### Epic 3: Multi-Currency & Geo Pricing  
- **Story 3.1**: Geo-detection for default currency
- **Story 3.2**: Currency switcher component
- **Story 3.3**: Price display per region (GBP/EUR/VND)
- **Story 3.4**: Admin UI for price mapping
- **Story 3.5**: VND zero-decimal handling

### Epic 4: Referral System
- **Story 4.1**: Unique referral code generation
- **Story 4.2**: Referral tracking on signup
- **Story 4.3**: Commission calculation (100% first month)
- **Story 4.4**: Referral dashboard with stats
- **Story 4.5**: Payout request system

### Epic 5: Client Portal
- **Story 5.1**: Dashboard with key metrics
- **Story 5.2**: Membership management page
- **Story 5.3**: Billing history and invoices
- **Story 5.4**: Settings (profile, notifications)
- **Story 5.5**: Support ticket system

### Epic 6: Internationalization
- **Story 6.1**: Locale routing (/en/*, /vi/*)
- **Story 6.2**: Language switcher with cookie persistence
- **Story 6.3**: Content translation (EN/VI)
- **Story 6.4**: Localized SEO (hreflang, sitemaps)
- **Story 6.5**: Date/time/currency formatting

### Epic 7: Analytics System
- **Story 7.1**: Event collection API (/api/analytics/collect)
- **Story 7.2**: Client-side tracking hook (useAnalytics)
- **Story 7.3**: Privacy-focused data processing
- **Story 7.4**: Analytics dashboard components
- **Story 7.5**: Data aggregation and reporting

### Epic 8: SEO & Performance
- **Story 8.1**: Dynamic sitemap generation
- **Story 8.2**: JSON-LD structured data
- **Story 8.3**: Meta tags and OpenGraph
- **Story 8.4**: Image optimization
- **Story 8.5**: Core Web Vitals optimization

## Sprint Planning

### Sprint 1 (Week 1)
- Epic 1: Stories 1.1-1.3 (Core auth)
- Epic 6: Story 6.1-6.2 (Basic i18n setup)

### Sprint 2 (Week 2)  
- Epic 1: Stories 1.4-1.5 (Roles & protection)
- Epic 2: Stories 2.1-2.2 (Stripe basics)

### Sprint 3 (Week 3)
- Epic 2: Stories 2.3-2.5 (Subscription mgmt)
- Epic 3: Stories 3.1-3.3 (Geo pricing)

### Sprint 4 (Week 4)
- Epic 4: All stories (Referral system)
- Epic 3: Stories 3.4-3.5 (Admin pricing)

### Sprint 5 (Week 5)
- Epic 5: All stories (Client portal)

### Sprint 6 (Week 6)
- Epic 7: All stories (Analytics)
- Epic 6: Stories 6.3-6.5 (Full i18n)

### Sprint 7 (Week 7)
- Epic 8: All stories (SEO/Performance)
- Bug fixes and polish

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Unit tests written (≥70% coverage)
- [ ] Integration tests passing
- [ ] Accessibility checked (axe clean)
- [ ] Performance budget met
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA sign-off

## Tech Debt Register

1. **2FA Implementation** - Future enhancement
2. **PayPal for VN** - Add when needed
3. **Advanced analytics** - Post-MVP
4. **Email templates** - Using basic for now
5. **CDN setup** - Optimize post-launch