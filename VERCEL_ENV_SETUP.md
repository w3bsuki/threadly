# Required Environment Variables for Vercel

## CRITICAL: Add these to your Vercel Dashboard NOW

Go to: https://vercel.com/[your-username]/threadly/settings/environment-variables

### 1. Stripe Configuration (REQUIRED)
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
```

Get these from: https://dashboard.stripe.com/apikeys

### 2. Optional but Recommended
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get this from: https://dashboard.stripe.com/webhooks (after creating a webhook endpoint)

### 3. App URL (REQUIRED in production)
```
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
```

## Quick Setup Commands

After adding the environment variables above, redeploy:

```bash
vercel --prod
```

## Verify Setup

Once deployed, check these endpoints:
- https://threadly-app.vercel.app/api/env-check
- https://threadly-app.vercel.app/api/master-diagnostics
- https://threadly-app.vercel.app/api/stripe/health

## If you don't have Stripe keys yet:

1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Go to "Developers" → "API keys"
4. Copy your test keys (sk_test_... and pk_test_...)
5. Add them to Vercel as shown above

Remember: The app WILL NOT WORK without at least the STRIPE_SECRET_KEY!