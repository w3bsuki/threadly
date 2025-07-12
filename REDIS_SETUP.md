# Redis Setup for Threadly Production

## Required Environment Variables

You need to add these environment variables to **BOTH** your Vercel deployments (app AND web):

```
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## Getting Upstash Redis Credentials

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database (or use existing)
3. In your database dashboard, find:
   - **REST URL**: Something like `https://maximum-ghost-41589.upstash.io`
   - **REST Token**: A long string starting with `AaJ1AAIjcDE...`

## Adding to Vercel

### For EACH deployment (app-threadly AND web-threadly):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add both variables:
   - `UPSTASH_REDIS_REST_URL` = your REST URL
   - `UPSTASH_REDIS_REST_TOKEN` = your REST Token
3. Make sure they're enabled for Production
4. **Redeploy both apps**

## Verification

After adding the variables and redeploying, verify Redis is working:

### 1. Check Cache Health
```bash
# Replace YOUR_ADMIN_SECRET with your actual admin secret
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://threadly-web-eight.vercel.app/api/admin/cache-health
```

Should return:
```json
{
  "status": "healthy",
  "cache": {
    "type": "redis",  // ← This MUST say "redis", not "memory"
    "connected": true,
    "healthy": true
  }
}
```

### 2. Check App Diagnostics
```bash
curl https://threadly-app.vercel.app/api/cache-diagnostic
```

Should show that it can reach the web app's cache endpoint.

## Testing Product Sync

1. Create a product in the seller dashboard
2. Immediately check the web marketplace
3. Product should appear instantly

## Monitoring

Check your deployment logs for:
- ✅ `[Cache] ✅ Connected to Redis cache at: https://...`
- ❌ `[Cache] ⚠️ WARNING: Falling back to memory cache!`

## Troubleshooting

### If still using memory cache:
1. Double-check environment variables are added to BOTH deployments
2. Ensure no typos in variable names
3. Redeploy after adding variables
4. Check Vercel build logs for any errors

### If products still don't appear:
1. Check if both apps show `"type": "redis"` in cache health
2. Verify ADMIN_SECRET matches between apps
3. Check browser console for CORS errors
4. Look at Vercel function logs for cache clearing errors

## Important Notes

- **BOTH apps must use the SAME Redis instance**
- Environment variables are case-sensitive
- You must redeploy after adding environment variables
- Free Upstash tier is sufficient for testing
- Redis is REQUIRED for products to sync between apps