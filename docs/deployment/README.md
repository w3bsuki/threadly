# DevOps Documentation - Threadly

## 🚀 Deployment Overview

Threadly uses a modern cloud-native deployment architecture optimized for scalability and reliability.

### Infrastructure Stack
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Neon PostgreSQL (Serverless)
- **Cache**: Upstash Redis
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Vercel Analytics
- **Secrets**: Vercel Environment Variables

### Deployment Environments
1. **Development**: Local development
2. **Preview**: Automatic PR deployments
3. **Staging**: Pre-production testing
4. **Production**: Live marketplace

---

## 🔐 Security Configuration

### Environment Variables Required

```bash
# Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (CRITICAL: Never commit!)
DATABASE_URL=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Real-time
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Storage
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Cache
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### Security Checklist
- [ ] All secrets in environment variables
- [ ] Database credentials rotated
- [ ] Webhook signatures verified
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] CSP headers configured
- [ ] API keys scoped appropriately

---

## 📦 Build & Deployment Process

### Local Development
```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
      
      - uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Deployment Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Link local project
vercel link

# Pull environment variables
vercel env pull
```

---

## 🔍 Monitoring & Observability

### Health Checks
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- `/api/health/cache` - Redis connectivity
- `/api/health/services` - All services status

### Key Metrics to Monitor
1. **Performance**
   - Core Web Vitals (LCP, FID, CLS)
   - API response times
   - Database query performance
   - Cache hit rates

2. **Business Metrics**
   - User registrations
   - Product listings
   - Transaction volume
   - Payment success rate

3. **Error Tracking**
   - JavaScript errors
   - API errors
   - Payment failures
   - Database connection issues

### Alerting Rules
```javascript
// Sentry Alert Configuration
{
  "name": "High Error Rate",
  "conditions": [
    {
      "id": "error_rate",
      "value": 5,
      "interval": "5m"
    }
  ],
  "actions": [
    {
      "type": "email",
      "targetType": "team"
    }
  ]
}
```

---

## 🚨 Incident Response

### Severity Levels
- **SEV1**: Complete outage, payment processing down
- **SEV2**: Major functionality broken, degraded performance
- **SEV3**: Minor features affected
- **SEV4**: Cosmetic issues

### Response Playbook

#### 1. Initial Response (5 min)
- Acknowledge incident
- Assess severity
- Create incident channel
- Notify stakeholders

#### 2. Investigation (15 min)
- Check monitoring dashboards
- Review recent deployments
- Analyze error logs
- Identify root cause

#### 3. Mitigation (30 min)
- Implement fix or rollback
- Verify resolution
- Monitor recovery
- Update status page

#### 4. Post-Mortem (24 hours)
- Document timeline
- Identify root cause
- Define action items
- Share learnings

---

## 🔄 Rollback Procedures

### Vercel Instant Rollback
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Database Rollback
```bash
# Using Prisma migrations
pnpm db:rollback

# Point-in-time recovery (Neon)
# Use Neon dashboard for PITR
```

### Feature Flags (Emergency)
```javascript
// Quick feature disable
export const features = {
  newCheckout: process.env.ENABLE_NEW_CHECKOUT !== 'false',
  aiChat: process.env.ENABLE_AI_CHAT !== 'false',
};
```

---

## 📈 Scaling Guidelines

### Automatic Scaling (Vercel)
- Edge functions scale automatically
- Serverless functions: 1000 concurrent
- Static assets: Unlimited via CDN

### Database Scaling (Neon)
```sql
-- Connection pooling configuration
ALTER DATABASE threadly SET 
  max_connections = 100;

-- Query optimization
CREATE INDEX idx_products_seller_status 
  ON products(seller_id, status);
```

### Caching Strategy
1. **Static Assets**: 1 year cache
2. **API Responses**: 5 min cache
3. **User Data**: No cache
4. **Product Data**: 10 min cache

---

## 🛠️ Maintenance Windows

### Scheduled Maintenance
- **Time**: Tuesdays 2-4 AM UTC
- **Frequency**: Monthly
- **Duration**: Max 2 hours
- **Notice**: 48 hours advance

### Zero-Downtime Deployments
1. Deploy new version
2. Warm up new instances
3. Gradually shift traffic
4. Monitor metrics
5. Complete migration

---

## 📊 Performance Optimization

### Build Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@repo/design-system'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Database Optimization
```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_orders_user_created 
  ON orders(user_id, created_at DESC);

-- Vacuum and analyze
VACUUM ANALYZE products;
```

### Bundle Size Targets
- Initial JS: <100KB
- First Load JS: <200KB
- Image sizes: <500KB
- Total page weight: <2MB

---

## 🔑 Access Management

### Role-Based Access
1. **Developer**: Code + preview deployments
2. **DevOps**: All deployments + infrastructure
3. **Admin**: Production access + billing

### Service Accounts
- GitHub Actions: Deploy only
- Monitoring: Read-only access
- Backup: Database read access

---

## 📱 Mobile App Deployment (Future)

### iOS Deployment
- TestFlight for beta
- App Store for production
- Fastlane automation

### Android Deployment
- Internal testing track
- Google Play Console
- Automated releases

---

## 🆘 Emergency Contacts

### Escalation Path
1. On-call engineer
2. Team lead
3. CTO
4. External support (Vercel, Neon)

### Key Services Support
- **Vercel**: support.vercel.com
- **Neon**: support.neon.tech
- **Stripe**: support.stripe.com
- **Clerk**: support.clerk.dev

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] TypeScript no errors
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Deployment
- [ ] Create deployment tag
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify health checks

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify business metrics
- [ ] Update status page
- [ ] Notify stakeholders

---

Last Updated: 2025-01-07
Next Review: Before production launch