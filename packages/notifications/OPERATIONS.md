# 🚀 THREADLY OPERATIONS DASHBOARD

*Live production operations guide - Last updated: January 9, 2025*

## 📊 PRODUCTION STATUS

### System Health
- **Overall Completion**: 97% (Ready for beta)
- **Infrastructure**: ✅ Production-ready
- **Core Features**: ✅ Working
- **Architecture**: ✅ Optimized (Next-Forge patterns)
- **Remaining**: Final polish, search optimization

### Working Features (What's Live)
- ✅ **E-commerce Core**: Products, cart, checkout, payments (Stripe Connect)
- ✅ **Social Features**: Real-time messaging, reviews, favorites
- ✅ **User Management**: Auth (Clerk), profiles, addresses
- ✅ **Admin Panel**: User/product moderation, analytics
- ✅ **Infrastructure**: Security, rate limiting, error handling

### Key Metrics
```bash
# Performance Targets
- First Load: < 2s ✅
- API Response: < 200ms ✅
- Error Rate: < 1% ✅
- Uptime: > 99.9% (target)

# Current Load
- Active Users: [Monitor in Clerk]
- Daily Orders: [Monitor in Stripe]
- Database Size: [Monitor in provider]
```

---

## 🚨 ACTIVE ISSUES & INCIDENTS

### 🔴 CRITICAL (Production Blockers)
1. **Search Performance** - Using database instead of Algolia
   - Impact: Slow search queries (>500ms)
   - Fix: Configure Algolia indexing (see Deployment section)
   - Workaround: Database queries with pagination

2. **Email System Partial** - Welcome emails missing
   - Impact: New users don't receive onboarding
   - Fix: Create welcome template, enable in auth webhook
   - Workaround: Manual onboarding support

### ⚠️ HIGH PRIORITY (Bad UX)
1. **Mobile Navigation** - Touch targets small
   - Files: `/apps/web/app/[locale]/components/header/index.tsx`
   - Impact: Hard to use on mobile devices
   - Fix: Increase to 44x44px minimum

2. **Missing Loading States**
   - Components: Messages, orders, search results
   - Impact: Users think app is frozen
   - Fix: Add skeleton loaders

### 🟡 MEDIUM PRIORITY (Improvements)
- Category selector hardcoded in some forms
- No offline support / PWA
- Missing message editing feature
- No bulk operations for admin

---

## 🔧 DEPLOYMENT PROCEDURES

### Quick Deploy Commands
```bash
# Development
pnpm dev                 # Start all apps locally
pnpm build              # Build for production
pnpm typecheck          # Check types before deploy

# Database
pnpm db:push            # Update schema
pnpm db:migrate:deploy  # Production migrations
pnpm db:seed            # Seed test data
pnpm db:studio          # View database

# Deploy to Vercel
vercel --prod           # Deploy to production
vercel env pull         # Get env vars locally
```

### Pre-Deployment Checklist
- [ ] Run `pnpm typecheck` - Must pass
- [ ] Run `pnpm build` - Must succeed
- [ ] Check `ISSUES.md` for new critical issues
- [ ] Verify all env vars in Vercel dashboard
- [ ] Test critical flows locally with prod env

### Deployment Steps
1. **Prepare Environment**
   ```bash
   # Pull latest code
   git pull origin main
   
   # Install dependencies
   pnpm install
   
   # Test with production env
   cp .env.production .env.local
   pnpm build && pnpm start
   ```

2. **Deploy to Vercel**
   ```bash
   # Deploy all apps
   vercel --prod
   
   # Or deploy specific app
   vercel --prod --scope your-team --project app
   ```

3. **Post-Deployment Verification**
   - [ ] Check all health endpoints
   - [ ] Test user signup flow
   - [ ] Verify product creation
   - [ ] Test checkout with test card
   - [ ] Monitor error rates in Sentry

---

## 🔐 PRODUCTION CONFIGURATION

### Required Environment Variables
```bash
# Database (PostgreSQL required for production)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Storage (UploadThing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# Email (Resend)
RESEND_TOKEN="re_..."
RESEND_FROM="noreply@threadly.com"

# Application URLs
NEXT_PUBLIC_APP_URL="https://app.threadly.com"
NEXT_PUBLIC_WEB_URL="https://threadly.com"
NEXT_PUBLIC_API_URL="https://api.threadly.com"

# Optional but Recommended
SENTRY_DSN="https://..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
UPSTASH_REDIS_REST_URL="https://..."
```

### Service Configuration

#### Stripe Connect Setup
1. Enable Express accounts in Dashboard
2. Set platform fee to 5%
3. Configure webhook: `https://api.threadly.com/webhooks/payments`
4. Required events: `payment_intent.succeeded`, `account.updated`

#### Clerk Production Setup
1. Add custom domains in Clerk dashboard
2. Configure webhooks: `https://api.threadly.com/webhooks/auth`
3. Enable social providers (Google, Apple)
4. Set session lifetime to 30 days

#### Database Indexes (PostgreSQL)
```sql
-- Performance critical indexes
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

---

## 📊 MONITORING & ALERTING

### Health Check Endpoints
```bash
# API Health
curl https://api.threadly.com/health

# App Health  
curl https://app.threadly.com/api/health

# Expected response
{"status":"ok","timestamp":"..."}
```

### Key Metrics to Monitor
1. **Application Performance**
   - Response time p95 < 500ms
   - Error rate < 1%
   - Apdex score > 0.9

2. **Business Metrics**
   - New user signups
   - Active listings
   - Completed orders
   - Platform revenue

3. **Infrastructure**
   - Database connections
   - Memory usage
   - CPU utilization
   - Storage usage

### Alert Configuration (Sentry)
- Error rate > 5% in 5 minutes → Critical
- New unhandled exception → Warning
- Database connection errors → Critical
- Payment failures → Critical
- Performance degradation > 2x → Warning

---

## 🔒 SECURITY CHECKLIST

### Required Security Measures
- [x] HTTPS enforced on all domains
- [x] CSRF protection implemented
- [x] Input sanitization (XSS prevention)
- [x] Rate limiting (Arcjet configured)
- [x] SQL injection prevention (Prisma)
- [x] Authentication on all API routes
- [x] Webhook signature verification
- [ ] Security headers configuration
- [ ] Content Security Policy

### Security Monitoring
- Monitor failed login attempts
- Track suspicious API usage patterns
- Review Stripe webhook failures
- Check for exposed sensitive data

---

## 🚨 INCIDENT RESPONSE

### Severity Levels
- **P0 (Critical)**: Site down, payments failing
- **P1 (High)**: Major feature broken, data loss risk
- **P2 (Medium)**: Feature degraded, workaround exists
- **P3 (Low)**: Minor bugs, cosmetic issues

### Response Procedures

#### Site Down (P0)
1. Check Vercel status page
2. Verify database connectivity
3. Check external service status (Clerk, Stripe)
4. Review recent deployments
5. Rollback if needed: `vercel rollback`

#### Payment Failures (P0)
1. Check Stripe dashboard for issues
2. Verify webhook processing
3. Check database order creation
4. Review payment logs in Sentry
5. Contact Stripe support if needed

#### Database Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1"

# View active connections
SELECT count(*) FROM pg_stat_activity;

# Kill stuck queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction';
```

#### Emergency Rollback
```bash
# List recent deployments
vercel ls

# Rollback to previous version
vercel rollback <deployment-url>

# Or git revert
git revert HEAD
git push origin main
```

---

## 🔄 MAINTENANCE TASKS

### Daily
- [ ] Check error rates in Sentry
- [ ] Review critical business metrics
- [ ] Monitor database performance
- [ ] Check external service status

### Weekly
- [ ] Review and close resolved issues
- [ ] Update dependencies (security patches)
- [ ] Database backup verification
- [ ] Performance trend analysis

### Monthly
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Capacity planning
- [ ] Documentation updates

### Maintenance Mode
```javascript
// Enable maintenance mode
// Set in Vercel env vars
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Scheduled maintenance until 2 PM UTC"

// In middleware.ts
if (process.env.MAINTENANCE_MODE === 'true') {
  return NextResponse.rewrite('/maintenance');
}
```

---

## 📞 ESCALATION & SUPPORT

### Internal Escalation
1. **On-call Engineer**: Check incident severity
2. **Team Lead**: P0/P1 incidents
3. **CTO**: Major outages, data issues

### External Support Contacts
- **Vercel**: support.vercel.com (Enterprise: priority support)
- **Clerk**: support@clerk.dev (Response: 24-48h)
- **Stripe**: support.stripe.com (Phone for urgent)
- **Database**: Check provider support channels
- **Sentry**: support@sentry.io

### Useful Commands Reference
```bash
# Database
pnpm db:studio          # Browse data
pnpm db:push           # Update schema
psql $DATABASE_URL     # Direct connection

# Debugging
vercel logs            # View deployment logs
vercel env ls          # List env vars
npm run build --debug  # Debug build issues

# Performance
curl -w "@curl-format.txt" https://api.threadly.com/health
```

---

## 📈 SCALING CONSIDERATIONS

### Current Limits
- Database connections: 100 (pooled)
- File upload: 8MB per image
- API rate limit: 100 req/min per user
- Vercel: 100 deployments/day

### When to Scale
- Database CPU > 80% sustained
- Response times > 1s p95
- Error rate > 2%
- Storage > 80% capacity

### Scaling Options
1. **Database**: Upgrade tier or add read replicas
2. **Caching**: Implement Redis (Upstash)
3. **CDN**: Already via Vercel Edge Network
4. **Search**: Migrate to Algolia (ready to enable)

---

*This is a living document. Update after incidents, deployments, and infrastructure changes.*