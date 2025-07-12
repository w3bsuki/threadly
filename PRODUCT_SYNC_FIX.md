# Product Sync Fix Documentation

## Issue: Products Not Appearing from App to Web

### Root Cause
The seller dashboard (`/app`) is configured with an incorrect web app URL, causing cache clearing failures when products are created.

### Configuration Mismatch
- **Configured in app**: `https://web-threadly.vercel.app`
- **Actual web URL**: `https://threadly-web-eight.vercel.app`

## Immediate Fix Required

### 1. Update Vercel Environment Variables

In your Vercel dashboard for the **app deployment** (`threadly-app`):

1. Go to Settings → Environment Variables
2. Find `NEXT_PUBLIC_WEB_URL`
3. Update the value to: `https://threadly-web-eight.vercel.app`
4. Redeploy the app

### 2. Verify Configuration

After updating, you can verify the configuration is correct:

```bash
# From app deployment
curl https://threadly-app.vercel.app/api/cache-diagnostic

# From web deployment  
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://threadly-web-eight.vercel.app/api/admin/cache-health
```

## Code Improvements Implemented

### 1. Retry Logic
- Added 3 retry attempts with 1-second delays
- 5-second timeout per request to prevent hanging
- Detailed error logging for troubleshooting

### 2. Enhanced Error Logging
- Logs include product ID, web URL, and attempt number
- Clear indication when cache clearing fails
- Non-critical errors don't block product creation

### 3. Health Check Endpoints
- `/api/admin/cache-health` - Verifies cache service is working
- `/api/cache-diagnostic` - Tests connectivity between apps

## How the System Works

1. **Product Creation Flow**:
   - User creates product in seller dashboard (`/app`)
   - Product saved to database
   - Product indexed to Algolia search
   - Cache cleared on web app to show new products immediately

2. **Cache Strategy**:
   - Web app caches products for 10 minutes
   - Cache must be cleared for immediate visibility
   - Without cache clearing, products appear after cache expires

## Monitoring

To monitor if the fix is working:

1. Check app logs for "Successfully cleared product cache on web app"
2. Look for errors starting with "Failed to clear cache"
3. Use the diagnostic endpoint to verify connectivity

## Prevention

To prevent similar issues:

1. Always verify production URLs match across deployments
2. Use the diagnostic endpoints during deployment
3. Monitor logs for cache clearing failures
4. Keep environment variables synchronized

## Testing

After applying the fix:

1. Create a test product in the seller dashboard
2. Immediately check the web marketplace
3. Product should appear without delay
4. Check logs for successful cache clearing

If products still don't appear immediately after the fix, check:
- Both apps are using the same database
- ADMIN_SECRET matches between apps
- No CORS or firewall issues between deployments