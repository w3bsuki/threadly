# Deployment & Production

## 🚀 Next-Forge Deployment Philosophy

Next-Forge applications are designed for production-first deployment with emphasis on reliability, performance, and scalability. The deployment strategy follows cloud-native principles with infrastructure as code and automated CI/CD pipelines.

## 🏗️ Deployment Architecture

### Multi-Environment Strategy

```
Production (main)     ←─ Staging (develop)     ←─ Feature Branches
├── apps/web         ├── apps/web             ├── Preview Deploys
├── apps/app         ├── apps/app             ├── E2E Testing
└── apps/api         └── apps/api             └── Integration Tests
```

### Infrastructure Components

```mermaid
graph TB
    A[Vercel Edge Network] --> B[Next.js Applications]
    B --> C[Database - Neon PostgreSQL]
    B --> D[Cache - Upstash Redis]
    B --> E[Storage - Vercel Blob]
    B --> F[Auth - Clerk]
    B --> G[Payments - Stripe]
    H[Monitoring - Sentry] --> B
    I[Analytics - PostHog] --> B
    J[Logs - BetterStack] --> B
```

## 🌐 Vercel Deployment Configuration

### Project Configuration

```json
// vercel.json (root)
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    },
    {
      "src": "apps/app/package.json", 
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    },
    {
      "src": "apps/api/package.json",
      "use": "@vercel/next",
      "config": {
        "distDir": ".next"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/apps/api/$1"
    },
    {
      "src": "/dashboard/(.*)",
      "dest": "/apps/app/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/web/$1"
    }
  ],
  "functions": {
    "apps/api/app/api/**/*.ts": {
      "maxDuration": 10
    },
    "apps/api/app/webhooks/**/*.ts": {
      "maxDuration": 15
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection", 
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.threadly.com/api/:path*"
    }
  ]
}
```

### Environment Variables Management

```bash
# Production Environment Variables (Vercel Dashboard)

# === CORE SERVICES ===
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# === AUTHENTICATION ===
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# === PAYMENTS ===
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# === MONITORING ===
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="sntryu_..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# === CACHING ===
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# === ANALYTICS ===
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# === SEARCH ===
ALGOLIA_APPLICATION_ID="..."
ALGOLIA_ADMIN_API_KEY="..."
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY="..."

# === EMAIL ===
RESEND_API_KEY="re_..."

# === LOGGING ===
BETTERSTACK_API_KEY="..."
BETTERSTACK_URL="https://logs.betterstack.com"

# === STORAGE ===
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# === SECURITY ===
NEXTAUTH_SECRET="..."
ENCRYPTION_KEY="..."
```

### Build Optimization

```typescript
// next.config.ts (production optimizations)
import { env } from '@/env';
import { withSentry } from '@sentry/nextjs';
import { withLogging } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    serverMinification: true,
    clientTraceMetadata: ['*'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            font-src 'self' data:;
            connect-src 'self' https://*.vercel.app https://api.stripe.com;
          `.replace(/\s+/g, ' ').trim(),
        },
      ],
    },
  ],
  
  // Bundle analysis
  bundlePagesRouterDependencies: true,
  
  // Redirects for SEO
  redirects: async () => [
    {
      source: '/home',
      destination: '/',
      permanent: true,
    },
  ],
  
  // Rewrites for API
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${env.API_URL}/api/:path*`,
    },
  ],
};

// Apply monitoring integrations
let configWithMonitoring = nextConfig;

if (process.env.NODE_ENV === 'production') {
  configWithMonitoring = withSentry(configWithMonitoring);
  configWithMonitoring = withLogging(configWithMonitoring);
}

export default configWithMonitoring;
```

## 🗄️ Database Deployment

### Migration Strategy

```typescript
// scripts/migrate-production.ts
import { execSync } from 'child_process';
import { database } from '@repo/database';

async function runProductionMigration() {
  console.log('Starting production migration...');
  
  try {
    // 1. Backup database
    console.log('Creating database backup...');
    execSync('pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql');
    
    // 2. Run migrations
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma');
    
    // 3. Generate client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate --schema=packages/database/prisma/schema.prisma');
    
    // 4. Verify database integrity
    console.log('Verifying database integrity...');
    const userCount = await database.user.count();
    const productCount = await database.product.count();
    
    console.log(`Migration successful. Users: ${userCount}, Products: ${productCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

runProductionMigration();
```

### Database Performance Configuration

```sql
-- Production database optimization
-- Apply these settings in Neon dashboard or connection string

-- Connection pooling
SET max_connections = 100;
SET shared_preload_libraries = 'pg_stat_statements';

-- Performance settings
SET effective_cache_size = '2GB';
SET shared_buffers = '512MB';
SET work_mem = '4MB';
SET maintenance_work_mem = '128MB';

-- Index optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
ON products USING GIN(to_tsvector('english', title || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status_created 
ON products(status, created_at DESC) WHERE status = 'AVAILABLE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status, created_at DESC);

-- Analyze tables for query optimization
ANALYZE products;
ANALYZE orders;
ANALYZE users;
```

## 🔄 CI/CD Pipeline

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    outputs:
      deployment-url: ${{ steps.deploy.outputs.url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run quality checks
        run: |
          pnpm typecheck
          pnpm lint
          pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Build applications
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$url" >> $GITHUB_OUTPUT
  
  migrate:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run database migrations
        run: pnpm migrate:prod
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
  
  e2e:
    needs: [test, migrate]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm playwright install
      
      - name: Run E2E tests against production
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ needs.test.outputs.deployment-url }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
  
  notify:
    needs: [test, migrate, e2e]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Notify Slack on Success
        if: ${{ needs.test.result == 'success' && needs.migrate.result == 'success' && needs.e2e.result == 'success' }}
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '🚀 Deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack on Failure
        if: ${{ needs.test.result == 'failure' || needs.migrate.result == 'failure' || needs.e2e.result == 'failure' }}
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: '❌ Deployment failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Automated Quality Gates

```typescript
// scripts/quality-gates.ts
import { execSync } from 'child_process';

interface QualityMetrics {
  typecheck: boolean;
  lint: boolean;
  test: boolean;
  coverage: number;
  bundleSize: number;
  performance: number;
}

async function runQualityGates(): Promise<QualityMetrics> {
  const metrics: QualityMetrics = {
    typecheck: false,
    lint: false,
    test: false,
    coverage: 0,
    bundleSize: 0,
    performance: 0,
  };
  
  try {
    // TypeScript validation
    console.log('Running TypeScript check...');
    execSync('pnpm typecheck', { stdio: 'inherit' });
    metrics.typecheck = true;
    
    // Linting
    console.log('Running ESLint...');
    execSync('pnpm lint', { stdio: 'inherit' });
    metrics.lint = true;
    
    // Testing with coverage
    console.log('Running tests with coverage...');
    const testOutput = execSync('pnpm test -- --coverage --reporter=json', { encoding: 'utf8' });
    const testResults = JSON.parse(testOutput);
    metrics.test = testResults.success;
    metrics.coverage = testResults.coverageMap.total.lines.pct;
    
    // Bundle size analysis
    console.log('Analyzing bundle size...');
    const bundleOutput = execSync('pnpm analyze', { encoding: 'utf8' });
    metrics.bundleSize = parseBundleSize(bundleOutput);
    
    // Performance metrics (Lighthouse CI)
    console.log('Running performance tests...');
    const performanceOutput = execSync('pnpm lhci autorun', { encoding: 'utf8' });
    metrics.performance = parsePerformanceScore(performanceOutput);
    
  } catch (error) {
    console.error('Quality gate failed:', error);
    throw error;
  }
  
  return metrics;
}

function validateQualityGates(metrics: QualityMetrics): void {
  const failures: string[] = [];
  
  if (!metrics.typecheck) failures.push('TypeScript validation failed');
  if (!metrics.lint) failures.push('Linting failed');
  if (!metrics.test) failures.push('Tests failed');
  if (metrics.coverage < 80) failures.push(`Coverage ${metrics.coverage}% below 80% threshold`);
  if (metrics.bundleSize > 500000) failures.push(`Bundle size ${metrics.bundleSize} bytes exceeds 500KB`);
  if (metrics.performance < 90) failures.push(`Performance score ${metrics.performance} below 90`);
  
  if (failures.length > 0) {
    console.error('Quality gates failed:');
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
  }
  
  console.log('✅ All quality gates passed!');
}

// Run quality gates
runQualityGates()
  .then(validateQualityGates)
  .catch(() => process.exit(1));
```

## 📊 Performance Monitoring

### Lighthouse CI Configuration

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/products',
        'http://localhost:3000/product/example',
        'http://localhost:3000/cart',
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Real User Monitoring (RUM)

```typescript
// apps/web/lib/monitoring.ts
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export function setupRUM() {
  // Track Core Web Vitals
  getCLS(console.log);
  getFCP(console.log);
  getFID(console.log);
  getLCP(console.log);
  getTTFB(console.log);
  
  // Send to analytics
  function sendToAnalytics(metric: any) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
    
    // Also send to PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      });
    }
  }
  
  getCLS(sendToAnalytics);
  getFCP(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

## 🔒 Security Hardening

### Security Headers Configuration

```typescript
// middleware.ts (production security)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP Header
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://js.clerk.dev;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.vercel.app https://api.stripe.com https://clerk.threadly.com;
    frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com;
  `.replace(/\s+/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Environment Security Validation

```typescript
// scripts/security-audit.ts
import { readFileSync } from 'fs';
import { join } from 'path';

interface SecurityIssue {
  severity: 'high' | 'medium' | 'low';
  description: string;
  file?: string;
  line?: number;
}

function auditSecurityIssues(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  // Check for hardcoded secrets
  const secretPatterns = [
    /sk_live_[a-zA-Z0-9]{24,}/g, // Stripe live keys
    /pk_live_[a-zA-Z0-9]{24,}/g, // Stripe publishable keys
    /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g, // Slack bot tokens
    /AIza[0-9A-Za-z_-]{35}/g, // Google API keys
  ];
  
  // Scan source files
  const sourceFiles = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"')
    .toString()
    .split('\n')
    .filter(Boolean);
  
  sourceFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf8');
      
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            severity: 'high',
            description: `Potential hardcoded secret found: ${matches[0].substring(0, 10)}...`,
            file: file,
          });
        }
      });
      
      // Check for dangerous patterns
      if (content.includes('eval(')) {
        issues.push({
          severity: 'high',
          description: 'Use of eval() detected',
          file: file,
        });
      }
      
      if (content.includes('dangerouslySetInnerHTML')) {
        issues.push({
          severity: 'medium',
          description: 'Use of dangerouslySetInnerHTML detected',
          file: file,
        });
      }
      
    } catch (error) {
      console.warn(`Could not read file: ${file}`);
    }
  });
  
  return issues;
}

// Run security audit
const issues = auditSecurityIssues();

if (issues.length > 0) {
  console.error('Security issues found:');
  issues.forEach(issue => {
    console.error(`[${issue.severity.toUpperCase()}] ${issue.description} (${issue.file})`);
  });
  
  const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
  if (highSeverityIssues.length > 0) {
    process.exit(1);
  }
} else {
  console.log('✅ No security issues found');
}
```

## 📈 Production Monitoring

### Application Performance Monitoring

```typescript
// instrumentation.ts (production monitoring)
import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.VERCEL_ENV || 'production',
      
      // Performance monitoring
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      
      // Session tracking
      autoSessionTracking: true,
      
      // Error filtering
      beforeSend(event) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError') {
            return null; // Don't report chunk load errors
          }
        }
        return event;
      },
      
      // Custom tags
      initialScope: {
        tags: {
          component: 'web',
          version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7),
        },
      },
    });
  }
}
```

### Health Check Endpoints

```typescript
// apps/api/app/health/route.ts
import { NextResponse } from 'next/server';
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    cache: boolean;
    dependencies: boolean;
  };
  metrics: {
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    response_time: number;
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  
  const checks = {
    database: false,
    cache: false,
    dependencies: true,
  };
  
  try {
    // Database health
    await database.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    // Cache health
    const cache = getCacheService();
    await cache.ping();
    checks.cache = true;
  } catch (error) {
    console.error('Cache health check failed:', error);
  }
  
  const allChecksPass = Object.values(checks).every(Boolean);
  const status: HealthStatus['status'] = allChecksPass ? 'healthy' : 'degraded';
  
  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
    checks,
    metrics: {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
      },
      response_time: Date.now() - startTime,
    },
  };
  
  return NextResponse.json(healthStatus, {
    status: allChecksPass ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
```

## 🎯 Production Best Practices Summary

### Deployment Checklist ✅

1. **Environment Configuration**
   - [ ] All environment variables configured in Vercel
   - [ ] Database migrations applied
   - [ ] SSL certificates configured
   - [ ] CDN and caching configured

2. **Security Validation**
   - [ ] Security headers configured
   - [ ] CSP policies implemented
   - [ ] Input validation on all endpoints
   - [ ] Authentication and authorization tested

3. **Performance Optimization**
   - [ ] Bundle size analyzed and optimized
   - [ ] Image optimization configured
   - [ ] Database indexes optimized
   - [ ] Caching strategies implemented

4. **Monitoring Setup**
   - [ ] Error tracking with Sentry
   - [ ] Performance monitoring enabled
   - [ ] Health check endpoints configured
   - [ ] Logging and alerting configured

5. **Quality Assurance**
   - [ ] All tests passing
   - [ ] E2E tests running against production
   - [ ] Performance tests meeting thresholds
   - [ ] Accessibility validation complete

### Production Maintenance

1. **Regular Updates**
   - Weekly dependency updates
   - Monthly security patches
   - Quarterly performance reviews

2. **Monitoring**
   - Daily health check reviews
   - Weekly performance analysis
   - Monthly cost optimization

3. **Backup and Recovery**
   - Daily automated database backups
   - Weekly recovery testing
   - Quarterly disaster recovery drills

This comprehensive deployment and production strategy ensures your Next-Forge application runs reliably, securely, and performantly in production environments.