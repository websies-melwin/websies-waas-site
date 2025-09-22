# Test Plan

## Test Strategy

### Scope
- Unit Testing: Business logic, utilities, hooks
- Integration Testing: API routes, database operations
- E2E Testing: Critical user journeys
- Performance Testing: Load times, API response
- Security Testing: Authentication, authorization, data protection
- Accessibility Testing: WCAG 2.1 AA compliance

### Coverage Targets
- Unit Tests: ≥70%
- Integration Tests: ≥60%
- E2E Critical Paths: 100%

## Unit Tests

### Components
```typescript
// Button.test.tsx
describe('Button Component', () => {
  it('renders with correct variant', () => {});
  it('handles click events', () => {});
  it('shows loading state', () => {});
  it('is disabled when specified', () => {});
});

// PricingCard.test.tsx
describe('PricingCard Component', () => {
  it('displays correct price for currency', () => {});
  it('shows discount badge when applicable', () => {});
  it('handles plan selection', () => {});
});
```

### Utilities
```typescript
// formatCurrency.test.ts
describe('formatCurrency', () => {
  it('formats GBP correctly', () => {});
  it('formats EUR correctly', () => {});
  it('handles VND zero-decimal', () => {});
});

// generateReferralCode.test.ts
describe('generateReferralCode', () => {
  it('generates unique 8-character code', () => {});
  it('uses only alphanumeric characters', () => {});
});
```

### Hooks
```typescript
// useAnalytics.test.ts
describe('useAnalytics', () => {
  it('batches events correctly', () => {});
  it('respects consent preferences', () => {});
  it('handles offline mode', () => {});
});
```

## Integration Tests

### Authentication
```typescript
describe('Auth API', () => {
  it('POST /api/auth/signup creates user', async () => {});
  it('POST /api/auth/login returns session', async () => {});
  it('POST /api/auth/logout clears session', async () => {});
  it('GET /auth/callback handles OAuth', async () => {});
});
```

### Subscriptions
```typescript
describe('Stripe Integration', () => {
  it('creates checkout session with correct Price ID', async () => {});
  it('handles webhook for subscription created', async () => {});
  it('updates database on successful payment', async () => {});
  it('handles failed payments gracefully', async () => {});
});
```

### Analytics
```typescript
describe('Analytics API', () => {
  it('POST /api/analytics/collect validates schema', async () => {});
  it('rejects events without consent', async () => {});
  it('enforces rate limits', async () => {});
  it('strips PII from events', async () => {});
});
```

### Database RLS
```typescript
describe('Row Level Security', () => {
  it('Client A cannot read Client B data', async () => {});
  it('Public cannot insert analytics events', async () => {});
  it('Users can only update own profile', async () => {});
});
```

## E2E Tests (Playwright)

### Critical User Journeys

#### 1. Signup to Subscription
```typescript
test('Complete signup and subscription flow', async ({ page }) => {
  // 1. Visit homepage
  await page.goto('/');
  
  // 2. Click "Get Started"
  await page.click('text=Get Started');
  
  // 3. Fill signup form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Test123!@#');
  await page.fill('[name="fullName"]', 'Test User');
  
  // 4. Submit and verify email sent
  await page.click('button[type="submit"]');
  await expect(page).toHaveText('Check your email');
  
  // 5. Simulate email verification
  await page.goto('/auth/callback?code=test');
  
  // 6. Select plan and checkout
  await page.click('text=Professional');
  await page.click('text=Subscribe Now');
  
  // 7. Complete Stripe checkout
  // (Mock in test environment)
  
  // 8. Verify dashboard access
  await expect(page).toHaveURL('/dashboard');
});
```

#### 2. Referral Flow
```typescript
test('Join via referral code', async ({ page }) => {
  // Visit with referral code
  await page.goto('/?ref=ABC12345');
  
  // Verify code pre-filled
  await page.click('text=Get Started');
  await expect(page.locator('[name="referralCode"]')).toHaveValue('ABC12345');
  
  // Complete signup
  // Verify referral tracked
});
```

#### 3. Language Switch
```typescript
test('Switch language preserves state', async ({ page }) => {
  // Start in English
  await page.goto('/pricing');
  
  // Switch to Vietnamese
  await page.click('[data-testid="language-switch"]');
  await page.click('text=Tiếng Việt');
  
  // Verify URL changed
  await expect(page).toHaveURL('/vi/pricing');
  
  // Verify content translated
  await expect(page).toHaveText('Giá cả');
});
```

#### 4. Portal Operations
```typescript
test('Manage subscription in portal', async ({ page }) => {
  // Login
  await loginAsUser(page);
  
  // Navigate to billing
  await page.click('text=Billing');
  
  // View invoices
  await expect(page.locator('.invoice-list')).toBeVisible();
  
  // Update payment method
  await page.click('text=Update Payment Method');
  // ...
});
```

## Performance Tests

### Page Load Times
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/pricing',
        'http://localhost:3000/dashboard'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}],
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],
      },
    },
  },
};
```

### API Load Testing
```javascript
// k6 load test
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Test analytics collection endpoint
  const payload = JSON.stringify({
    events: [{
      name: 'page_view',
      path: '/test',
      timestamp: Date.now(),
    }],
  });
  
  const res = http.post('https://websies.co/api/analytics/collect', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Security Tests

### Authentication
- [ ] Password requirements enforced
- [ ] Session expiry works correctly
- [ ] Rate limiting on login attempts
- [ ] CSRF tokens validated

### Authorization
- [ ] Role-based access enforced
- [ ] API routes protected
- [ ] RLS policies working
- [ ] Service role key not exposed

### Data Protection
- [ ] PII not logged
- [ ] Sensitive data encrypted
- [ ] HTTPS enforced
- [ ] CSP headers set

## Accessibility Tests

### Automated
```javascript
// axe-core tests
describe('Accessibility', () => {
  it('has no violations on homepage', async () => {
    const results = await axe(page);
    expect(results.violations).toHaveLength(0);
  });
});
```

### Manual
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] ARIA labels correct

## Test Data

### Users
```json
{
  "owner": {
    "email": "owner@test.com",
    "password": "Test123!@#",
    "role": "owner"
  },
  "admin": {
    "email": "admin@test.com",
    "password": "Test123!@#",
    "role": "admin"
  },
  "client": {
    "email": "client@test.com",
    "password": "Test123!@#",
    "role": "client"
  }
}
```

### Subscriptions
```json
{
  "plans": [
    {
      "name": "Professional",
      "price_gbp": 4700,
      "price_eur": 5500,
      "price_vnd": 1500000
    }
  ]
}
```

## Test Execution

### Daily
- Unit tests on every commit
- Integration tests on PR

### Weekly
- Full E2E suite
- Performance tests
- Security scan

### Release
- Full regression
- Load testing
- Accessibility audit
- Cross-browser testing

## Bug Tracking

### Severity Levels
- **Critical**: System down, data loss, security breach
- **High**: Major feature broken, payment issues
- **Medium**: Minor feature broken, UX issues
- **Low**: Cosmetic issues, typos

### Bug Report Template
```markdown
**Environment:** [Production/Staging/Local]
**Browser:** [Chrome/Safari/Firefox + version]
**User Role:** [Owner/Admin/Client/Public]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots/Video:**

**Additional Context:**
```