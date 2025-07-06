# 🔍 Production Monitoring Setup Guide

This guide walks you through setting up comprehensive monitoring for the Threadly marketplace using Sentry and other observability tools.

## 📊 Current Monitoring Infrastructure

✅ **Already Implemented:**
- Sentry error tracking and performance monitoring
- Logtail structured logging
- React error boundaries with Sentry integration
- API monitoring middleware
- Marketplace-specific context tracking
- Database operation monitoring
- Stripe payment operation tracking

## 🚀 Quick Setup (5 minutes)

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new organization for "Threadly"
3. Create a project with platform "Next.js"
4. Note down the following values:
   - **DSN** (from Project Settings > Client Keys)
   - **Organization Slug** (from URL: `sentry.io/organizations/[slug]`)
   - **Project Slug** (from URL: `sentry.io/organizations/[org]/projects/[project]`)

### 2. Create Auth Token

1. Go to Organization Settings > Auth Tokens
2. Create new token with scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy the token value

### 3. Set Environment Variables

Update your production environment variables:

```bash
# Required for both client and server
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"

# Required for release tracking
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-slug"
SENTRY_AUTH_TOKEN="your-auth-token"

# Environment identification
SENTRY_ENVIRONMENT="production"
NEXT_PUBLIC_SENTRY_ENVIRONMENT="production"

# Release tracking (auto-set on Vercel)
SENTRY_RELEASE="$VERCEL_GIT_COMMIT_SHA"
NEXT_PUBLIC_SENTRY_RELEASE="$VERCEL_GIT_COMMIT_SHA"

# Optional: Better Stack (uptime monitoring)
BETTERSTACK_API_KEY="your-key"
BETTERSTACK_URL="https://uptime.betterstack.com/api/v2"
```

### 4. Verify Setup

Run the monitoring validation:

```bash
pnpm run check:monitoring
```

## 📈 What You Get

### Error Tracking
- **Real-time error alerts** when issues occur
- **User context** - see which users are affected
- **Product context** - errors linked to specific products/orders
- **Session replay** - watch user sessions leading to errors
- **Performance monitoring** - slow API calls and database queries

### Business Intelligence
- **Payment failure tracking** - Stripe errors with order context
- **Search performance** - slow searches affecting user experience
- **Image upload issues** - failed uploads with file details
- **Cart abandonment** - errors in checkout flow

### Performance Monitoring
- **API response times** across all endpoints
- **Database query performance** with slow query alerts
- **Front-end performance** - Core Web Vitals tracking
- **Third-party service monitoring** - Stripe, UploadThing, etc.

## 🔧 Advanced Configuration

### Custom Alerts

Set up alerts in Sentry for:

```javascript
// High-priority alerts
- Error rate > 5% in 5 minutes
- Payment processing errors
- Database connection failures
- Slow API responses > 2 seconds

// Business alerts  
- Cart abandonment spikes
- Product upload failures
- Search result anomalies
- User authentication issues
```

### Performance Thresholds

Configure performance monitoring:

```javascript
// API Performance
- Database queries > 500ms
- API endpoints > 1000ms
- Stripe operations > 2000ms
- Image uploads > 10 seconds

// Frontend Performance
- Largest Contentful Paint > 2.5s
- First Input Delay > 100ms
- Cumulative Layout Shift > 0.1
```

### Privacy & Security

The monitoring setup includes:

- ✅ **PII protection** - emails, payment info automatically masked
- ✅ **Session replay privacy** - sensitive forms blocked
- ✅ **Error filtering** - network errors and browser extensions filtered
- ✅ **Rate limiting** - prevents spam from affecting metrics

## 📱 Monitoring Each App

### Web App (Customer Marketplace)
- **User journey tracking** - product views, cart additions, purchases
- **Search performance** - query speed and result relevance
- **Payment flow monitoring** - checkout completion rates
- **Performance metrics** - page load times, Core Web Vitals

### Seller Dashboard App
- **Seller workflow tracking** - product creation, order management
- **Stripe Connect monitoring** - payout processing, account setup
- **Business analytics** - revenue tracking, performance metrics
- **Inventory management** - stock updates, product status changes

### API App
- **Endpoint performance** - all REST routes monitored
- **Database operations** - query performance and error rates
- **External service health** - Stripe, UploadThing, email service
- **Authentication flows** - Clerk webhook processing

## 🚨 Alert Setup

### Critical Alerts (Immediate Response)
- Payment processing failures
- Database connection errors
- API error rate > 5%
- Stripe webhook failures

### Warning Alerts (Next Business Day)
- Slow database queries
- High cart abandonment
- Image upload failures
- Search performance degradation

### Business Metrics (Weekly Review)
- User conversion rates
- Product listing success rates
- Seller onboarding completion
- Customer satisfaction trends

## 🔍 Debugging with Context

When errors occur, you'll see:

```javascript
// User Context
- User ID, role (buyer/seller), email
- Stripe customer/connect account IDs
- Current cart contents, recent orders

// Product Context  
- Product ID, title, price, seller
- Category, status, images
- Related orders or cart items

// Business Context
- Search queries leading to error
- Payment intent IDs for transaction errors
- Upload file details for image errors
- API performance metrics
```

## 📊 Dashboards

Create custom dashboards for:

### Executive Dashboard
- Revenue impact of errors
- User-facing error rates
- System uptime and performance
- Payment success rates

### Engineering Dashboard
- API performance by endpoint
- Database query performance
- Error rates by service
- Deployment success rates

### Business Dashboard
- Product listing success rates
- Search performance metrics
- User onboarding funnel
- Seller performance metrics

## 🎯 Success Metrics

Track these KPIs:

### Technical Health
- 99.9% uptime target
- < 500ms median API response
- < 1% error rate across all services
- < 2s page load times

### Business Health  
- Payment success rate > 98%
- Product upload success > 95%
- Search result quality scores
- User session completion rates

## 🆘 Troubleshooting

### Common Issues

**Sentry not receiving events?**
- Check DSN configuration
- Verify environment variables
- Check browser console for initialization errors

**Too many noise alerts?**
- Adjust error filtering in `client.ts`
- Set appropriate sample rates
- Configure alert thresholds

**Missing user context?**
- Ensure `setUserContext` called after auth
- Check Clerk integration
- Verify user data availability

## 📞 Support

For setup help:
1. Check the validation output: `pnpm run check:monitoring`
2. Review Sentry documentation: [docs.sentry.io](https://docs.sentry.io)
3. Contact the engineering team with validation results

---

**Next Steps:**
1. Set up Sentry project (5 minutes)
2. Configure environment variables
3. Deploy and verify monitoring works
4. Set up custom alerts and dashboards
5. Review weekly monitoring reports