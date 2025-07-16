# deployment.md

Threadly Deployment Guide - Essential information for Vercel deployment.

## ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# URLs
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web-eight.vercel.app

# Redis (REQUIRED)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AaJ1AAIjcDE...
```

## DEPLOYMENT STEPS

1. Add env vars to Vercel Dashboard
2. Deploy: `vercel --prod`
3. Seed categories: `curl https://your-web-app.vercel.app/api/seed-categories`
4. Configure Clerk webhook:
   - URL: `https://your-app.vercel.app/api/webhooks/clerk`
   - Events: user.created, user.updated, user.deleted

## VERIFICATION

```bash
# Check environment
curl https://threadly-app.vercel.app/api/env-check

# Full diagnostics
curl https://threadly-app.vercel.app/api/master-diagnostics

# Redis health (MUST show "type": "redis")
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://threadly-web-eight.vercel.app/api/admin/cache-health
```

## COMMON ISSUES

| Issue | Fix |
|-------|-----|
| Server render error | Check all env vars |
| Products not syncing | Verify Redis credentials match |
| Memory cache warning | Add UPSTASH_REDIS_* vars |
| Prisma errors | Clear Vercel cache |
| Auth fails | Check Clerk webhook |

## POST-DEPLOY CHECKLIST

- [ ] All env vars set for BOTH apps
- [ ] Redis connected (not memory cache)
- [ ] Categories seeded
- [ ] Stripe onboarding works
- [ ] Products sync between apps
- [ ] Cross-app navigation works

## DEBUG

1. Check `/api/master-diagnostics`
2. Verify Redis shows `"type": "redis"`
3. Monitor Vercel function logs
4. Test in preview before production