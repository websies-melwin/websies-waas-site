# Production Runbook

## Emergency Contacts

- **On-Call Engineer**: [Rotation Schedule]
- **Product Owner**: [Contact]
- **DevOps Lead**: [Contact]
- **Stripe Support**: [Dashboard Link]
- **Supabase Support**: [Dashboard Link]

## Common Operations

### 1. Deployment

#### Production Deploy
```bash
# Ensure on main branch
git checkout main
git pull origin main

# Run tests
npm test

# Deploy
vercel --prod
```

#### Rollback
```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "Promote to Production"
```

### 2. Database Operations

#### Connect to Production DB
```bash
supabase db remote set
supabase db remote commit
```

#### Emergency Queries
```sql
-- Disable user access
UPDATE auth.users 
SET banned_until = '2099-12-31' 
WHERE email = 'user@example.com';

-- Check subscription status
SELECT * FROM subscriptions 
WHERE user_id = 'uuid-here' 
ORDER BY created_at DESC;

-- View recent errors
SELECT * FROM analytics_events 
WHERE event_name = 'error' 
AND created_at > now() - interval '1 hour'
ORDER BY created_at DESC;
```

### 3. Monitoring

#### Health Checks
- **Uptime**: https://websies.co/api/health
- **Database**: Supabase Dashboard > Database > Health
- **Payments**: Stripe Dashboard > Developers > Webhooks

#### Key Metrics
- Response time < 200ms (p95)
- Error rate < 1%
- Database connections < 80%
- Payment success rate > 95%

### 4. Incident Response

#### Severity Levels
- **P1**: Complete outage, payment failures
- **P2**: Partial outage, degraded performance
- **P3**: Minor issues, cosmetic bugs
- **P4**: Improvements, feature requests

#### Response Process
1. **Acknowledge** - Respond within SLA
2. **Assess** - Determine impact and severity
3. **Communicate** - Update status page
4. **Mitigate** - Apply temporary fix if needed
5. **Resolve** - Implement permanent solution
6. **Review** - Post-mortem within 48 hours

### 5. Common Issues

#### Issue: High Database Load
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';
```

#### Issue: Stripe Webhook Failures
1. Check webhook endpoint status in Stripe
2. Verify webhook secret in env vars
3. Check recent webhook attempts
4. Replay failed webhooks from Stripe dashboard

#### Issue: Authentication Problems
1. Check Supabase Auth logs
2. Verify JWT secret rotation
3. Clear user sessions if needed
4. Check email service status

### 6. Scaling Operations

#### Traffic Surge
1. Enable Vercel Auto-scaling
2. Increase Supabase connection pool
3. Enable CDN for static assets
4. Implement rate limiting if needed

#### Database Performance
1. Check slow query log
2. Update table statistics
3. Add missing indexes
4. Consider read replicas

### 7. Backup & Recovery

#### Automated Backups
- Database: Daily via Supabase (30-day retention)
- Code: Git repository
- Secrets: Encrypted in password manager

#### Manual Backup
```bash
# Database export
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Environment snapshot
vercel env pull
```

#### Recovery Process
1. Assess data loss
2. Restore from latest backup
3. Apply transaction logs if available
4. Verify data integrity
5. Test application functionality

### 8. Security Incidents

#### Suspected Breach
1. **Isolate** - Disable affected accounts
2. **Investigate** - Check audit logs
3. **Contain** - Rotate secrets
4. **Eradicate** - Remove threat
5. **Recover** - Restore service
6. **Document** - File incident report

#### Secret Rotation
```bash
# Rotate Supabase keys
supabase project api-keys regenerate

# Update Vercel env
vercel env rm SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Rotate Stripe webhook secret
# Done via Stripe Dashboard
```

### 9. Maintenance Mode

#### Enable Maintenance
1. Set NEXT_PUBLIC_MAINTENANCE=true in Vercel
2. Deploy maintenance page
3. Pause Stripe subscriptions if extended

#### Disable Maintenance
1. Set NEXT_PUBLIC_MAINTENANCE=false
2. Redeploy application
3. Verify all services operational
4. Resume Stripe subscriptions

### 10. Performance Optimization

#### Quick Wins
- Enable Next.js ISR for marketing pages
- Implement Redis caching for sessions
- Optimize images with next/image
- Enable Brotli compression
- Implement database query caching

#### Monitoring Tools
- Lighthouse CI
- Sentry Performance
- Vercel Analytics
- Supabase Query Performance