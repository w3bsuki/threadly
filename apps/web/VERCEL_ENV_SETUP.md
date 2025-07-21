# Vercel Environment Variables Setup

## CRITICAL: Update Database URL

The database password has been rotated. Update DATABASE_URL in Vercel dashboard.

### New Database URL:
```
postgresql://threadly_owner:npg_iEZ5Pqg8UYLo@ep-soft-art-a2tlilgq-pooler.eu-central-1.aws.neon.tech/threadly?sslmode=require
```

### Update in Vercel:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update DATABASE_URL with new password
3. Apply to all environments
4. Redeploy all apps

### Security:
- Never commit credentials
- Use Vercel env UI only
- Rotate if exposed
