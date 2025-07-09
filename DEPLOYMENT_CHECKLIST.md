# Deployment Checklist for Threadly

## Pre-Deployment Verification

### 1. Environment Variables (Vercel Dashboard)

**Required for Production:**
```
# Database
DATABASE_URL=postgresql://...

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_... (or sk_test_ for staging)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_)

# Application URLs
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web-eight.vercel.app
```

**Optional but Recommended:**
```
# File Uploads
UPLOADTHING_SECRET=...
NEXT_PUBLIC_UPLOADTHING_APP_ID=...

# Email
RESEND_TOKEN=...
RESEND_FROM=noreply@threadly.com

# Real-time
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...
LIVEBLOCKS_SECRET=...

# Cache
REDIS_URL=...

# Admin
ADMIN_SECRET=... (for cache clearing)
```

### 2. Verification Steps

1. **Check Environment Variables**
   ```bash
   curl https://threadly-app.vercel.app/api/env-check
   ```

2. **Run Master Diagnostics**
   ```bash
   curl https://threadly-app.vercel.app/api/master-diagnostics
   ```

3. **Test Stripe Integration**
   ```bash
   curl https://threadly-app.vercel.app/api/stripe/diagnose
   ```

4. **Verify Database Connection**
   ```bash
   curl https://threadly-app.vercel.app/api/debug-db
   ```

5. **Check Auth Configuration**
   ```bash
   curl https://threadly-app.vercel.app/api/debug-auth
   ```

### 3. Common Issues and Solutions

#### Issue: Server Components render error
**Solution:** Check that all environment variables are set correctly in Vercel dashboard

#### Issue: Stripe onboarding returns 404
**Solution:** 
- Ensure STRIPE_SECRET_KEY is set
- Verify NEXT_PUBLIC_APP_URL is correct
- Check that locale is included in redirects

#### Issue: Database connection fails
**Solution:** 
- Verify DATABASE_URL is correct
- Check that database is accessible from Vercel's IP ranges

#### Issue: Auth fails
**Solution:**
- Ensure all Clerk environment variables are set
- Verify webhook endpoint is configured in Clerk dashboard

### 4. Post-Deployment Verification

1. **Test User Flow:**
   - Sign up as new user
   - Complete onboarding
   - Connect Stripe account
   - Create a test product
   - Verify product appears on web app

2. **Monitor Logs:**
   - Check Vercel function logs
   - Monitor Sentry for errors
   - Review Stripe webhook logs

3. **Performance Check:**
   - Test page load times
   - Verify caching is working
   - Check API response times

### 5. Rollback Plan

If deployment fails:
1. Revert to previous deployment in Vercel
2. Check error logs for root cause
3. Fix issues in development
4. Re-run deployment checklist

## Quick Debug Commands

```bash
# Check all diagnostics
curl https://threadly-app.vercel.app/api/master-diagnostics | jq

# Test Stripe specifically
curl https://threadly-app.vercel.app/api/stripe/test | jq

# Check environment
curl https://threadly-app.vercel.app/api/env-check | jq

# Debug specific user (requires auth)
curl -H "Cookie: <auth-cookie>" https://threadly-app.vercel.app/api/debug-stripe | jq
```

## Emergency Contacts

- Vercel Support: support.vercel.com
- Clerk Support: clerk.com/support
- Stripe Support: support.stripe.com

Remember: Always test in staging/preview deployments before promoting to production!