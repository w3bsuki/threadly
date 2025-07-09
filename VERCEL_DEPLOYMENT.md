# Vercel Deployment Guide for Threadly

This guide ensures your Threadly marketplace deploys correctly on Vercel with a working database connection.

## Prerequisites

1. Neon Database account with PostgreSQL database
2. Vercel account connected to your GitHub repository
3. All environment variables from `.env.local` files

## Critical Environment Variables

### For Web App (Customer Marketplace)
Set these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://threadly_owner:npg_qwPJ5Ziazf4O@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require"

# Authentication (REQUIRED)
CLERK_SECRET_KEY="sk_test_qzeMsx0ir9P6MHAy2sxfo9hPkEfZAZbcFgg2KgcTlj"
CLERK_WEBHOOK_SECRET="whsec_oTwICCxnc75jIknXIt+EuzmhaaXFJM5z"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_bGVuaWVudC1jaGltcC03NC5jbGVyay5hY2NvdW50cy5kZXYk"

# App URLs (IMPORTANT - Update these with your actual domains)
NEXT_PUBLIC_APP_URL="https://your-seller-app.vercel.app"
NEXT_PUBLIC_WEB_URL="https://your-web-app.vercel.app"

# Other required keys (copy from .env.local)
```

### For App (Seller Dashboard)
Same as above, but ensure `NEXT_PUBLIC_WEB_URL` points to your web app deployment.

## Deployment Steps

### 1. Database Setup

The database schema will be automatically deployed thanks to the postinstall script we added:
```json
"postinstall": "prisma generate --no-hints --schema=./prisma/schema.prisma"
```

### 2. Build Configuration

No special build configuration needed - Vercel will automatically:
1. Install dependencies
2. Generate Prisma client (via postinstall)
3. Build the Next.js app

### 3. Initial Data Setup

After first deployment:

1. **Create categories** by visiting:
   ```
   https://your-web-app.vercel.app/api/seed-categories
   ```

2. **Seed test products** (optional):
   ```
   https://your-web-app.vercel.app/api/seed-products
   ```

3. **Verify database connection**:
   ```
   https://your-web-app.vercel.app/api/check-db
   ```

### 4. Webhook Configuration

In Clerk Dashboard:
1. Go to Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/clerk`
3. Select events:
   - user.created
   - user.updated
   - user.deleted
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET` in Vercel

## Troubleshooting

### Products Not Showing

1. **Check database connection**:
   ```bash
   curl https://your-web-app.vercel.app/api/check-db
   ```

2. **Verify environment variables** in Vercel dashboard
   - Ensure `DATABASE_URL` is set correctly
   - Check for typos or missing quotes

3. **Check Vercel Function logs**:
   - Dashboard > Functions > View logs
   - Look for database connection errors

### Prisma Client Errors

If you see "Prisma client not generated":
1. Ensure the postinstall script is in `packages/database/package.json`
2. Clear Vercel build cache: Settings > Advanced > Clear Cache
3. Redeploy

### Cross-App Navigation Issues

Ensure these environment variables match your actual deployment URLs:
- `NEXT_PUBLIC_APP_URL` - Seller dashboard URL
- `NEXT_PUBLIC_WEB_URL` - Customer marketplace URL

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database URL is production Neon connection string
- [ ] Clerk webhook configured
- [ ] Categories seeded
- [ ] Test user can sign up and complete onboarding
- [ ] Products display correctly on homepage
- [ ] Seller can create new listings
- [ ] Cross-app navigation works

## User Flow Testing

1. **New User Registration**:
   - Visit web app
   - Click "Sell Now"
   - Sign up with Clerk
   - Complete onboarding wizard
   - Redirected to appropriate dashboard

2. **Product Creation**:
   - In seller dashboard, create new product
   - Verify it appears in web marketplace

3. **Buyer Flow**:
   - Browse products on web
   - Add to favorites
   - Proceed to checkout

## Support

If products still don't show after following this guide:
1. Check Vercel function logs
2. Test database connection with `/api/check-db`
3. Verify Prisma client generation in build logs
4. Ensure DATABASE_URL has proper SSL parameters