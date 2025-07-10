#!/bin/bash

# Essential environment variables for Vercel deployment
# Using dummy values for now - replace with real values in production

echo "Setting environment variables for threadly-web..."

# Core environment variables needed for build
vercel env add DATABASE_URL production <<< "postgresql://dummy:dummy@localhost/threadly"
vercel env add CLERK_SECRET_KEY production <<< "sk_test_dummy"
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production <<< "pk_test_dummy"

# URLs for interconnected apps
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://threadly-app-w3bsukis-projects.vercel.app"
vercel env add NEXT_PUBLIC_WEB_URL production <<< "https://threadly-web-w3bsukis-projects.vercel.app"
vercel env add NEXT_PUBLIC_API_URL production <<< "https://threadly-api-1-w3bsukis-projects.vercel.app"

# Additional required env vars with dummy values
vercel env add RESEND_TOKEN production <<< "re_dummy"
vercel env add STRIPE_SECRET_KEY production <<< "sk_test_dummy"
vercel env add ARCJET_KEY production <<< "ajkey_dummy"
vercel env add FLAGS_SECRET production <<< "dummy_secret"
vercel env add BASEHUB_TOKEN production <<< "bshb_dummy"

echo "Environment variables set for threadly-web!"