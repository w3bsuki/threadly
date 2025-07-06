#!/usr/bin/env tsx

/**
 * Monitoring Setup Validation Script for Threadly
 * 
 * This script validates the current monitoring setup and provides
 * actionable feedback for production readiness.
 */

import { validateProductionReadiness, generateSentrySetupGuide } from '../packages/observability/production-monitoring';
import { keys } from '../packages/observability/keys';

function printHeader(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`🔍 ${title}`);
  console.log('='.repeat(60));
}

function printSection(title: string) {
  console.log(`\n📋 ${title}`);
  console.log('-'.repeat(40));
}

function printSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function printWarning(message: string) {
  console.log(`⚠️  ${message}`);
}

function printError(message: string) {
  console.log(`❌ ${message}`);
}

function printInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

async function checkEnvironmentVariables() {
  printSection('Environment Variables Check');
  
  try {
    const env = keys();
    
    // Check server-side Sentry config
    if (env.SENTRY_DSN) {
      printSuccess(`Sentry DSN configured: ${env.SENTRY_DSN.substring(0, 30)}...`);
    } else {
      printError('SENTRY_DSN not configured');
    }
    
    if (env.SENTRY_ORG) {
      printSuccess(`Sentry Organization: ${env.SENTRY_ORG}`);
    } else {
      printError('SENTRY_ORG not configured');
    }
    
    if (env.SENTRY_PROJECT) {
      printSuccess(`Sentry Project: ${env.SENTRY_PROJECT}`);
    } else {
      printError('SENTRY_PROJECT not configured');
    }
    
    if (env.SENTRY_AUTH_TOKEN) {
      printSuccess('Sentry Auth Token configured');
    } else {
      printWarning('SENTRY_AUTH_TOKEN not configured (needed for releases)');
    }
    
    if (env.SENTRY_ENVIRONMENT) {
      printSuccess(`Sentry Environment: ${env.SENTRY_ENVIRONMENT}`);
    } else {
      printWarning('SENTRY_ENVIRONMENT not set (defaulting to NODE_ENV)');
    }
    
    // Check client-side Sentry config
    if (env.NEXT_PUBLIC_SENTRY_DSN) {
      printSuccess('Client-side Sentry DSN configured');
    } else {
      printError('NEXT_PUBLIC_SENTRY_DSN not configured');
    }
    
    if (env.NEXT_PUBLIC_SENTRY_ENVIRONMENT) {
      printSuccess(`Client Environment: ${env.NEXT_PUBLIC_SENTRY_ENVIRONMENT}`);
    } else {
      printWarning('NEXT_PUBLIC_SENTRY_ENVIRONMENT not set');
    }
    
    // Check Better Stack (optional)
    if (env.BETTERSTACK_API_KEY) {
      printSuccess('Better Stack uptime monitoring configured');
    } else {
      printInfo('Better Stack not configured (optional)');
    }
    
  } catch (error) {
    printError(`Environment validation failed: ${error.message}`);
  }
}

async function checkProductionReadiness() {
  printSection('Production Readiness Check');
  
  try {
    const result = validateProductionReadiness();
    
    if (result.ready) {
      printSuccess('✨ Monitoring is production ready!');
    } else {
      printError('❌ Monitoring is NOT production ready');
    }
    
    if (result.issues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      result.issues.forEach(issue => printError(issue));
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => printWarning(rec));
    }
    
    return result.ready;
    
  } catch (error) {
    printError(`Production readiness check failed: ${error.message}`);
    return false;
  }
}

function checkAppConfigurations() {
  printSection('App Configuration Check');
  
  const apps = [
    { name: 'Web App', path: './apps/web' },
    { name: 'Seller Dashboard', path: './apps/app' },
    { name: 'API', path: './apps/api' },
  ];
  
  apps.forEach(app => {
    try {
      // Check if instrumentation.ts exists
      const fs = require('fs');
      const instrumentationPath = `${app.path}/instrumentation.ts`;
      
      if (fs.existsSync(instrumentationPath)) {
        printSuccess(`${app.name}: Instrumentation configured`);
      } else {
        printError(`${app.name}: Missing instrumentation.ts`);
      }
      
      // Check if global-error.tsx exists
      const errorBoundaryPath = `${app.path}/app/global-error.tsx`;
      if (fs.existsSync(errorBoundaryPath)) {
        printSuccess(`${app.name}: Error boundary configured`);
      } else {
        printWarning(`${app.name}: Missing global error boundary`);
      }
      
      // Check next.config.ts for Sentry integration
      const nextConfigPath = `${app.path}/next.config.ts`;
      if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8');
        if (content.includes('withSentry')) {
          printSuccess(`${app.name}: Sentry build integration configured`);
        } else {
          printWarning(`${app.name}: Sentry build integration missing`);
        }
      }
      
    } catch (error) {
      printError(`${app.name}: Configuration check failed - ${error.message}`);
    }
  });
}

function printSetupGuide() {
  printSection('Setup Guide');
  
  const guide = generateSentrySetupGuide({
    appName: 'Threadly Marketplace',
    domains: ['threadly.com', 'app.threadly.com', 'api.threadly.com']
  });
  
  console.log(`\n📖 ${guide.title}\n`);
  
  guide.steps.forEach(step => {
    console.log(`${step.step}. ${step.title}`);
    console.log(`   ${step.description}`);
    
    if ('actions' in step) {
      step.actions.forEach(action => {
        console.log(`   • ${action}`);
      });
    }
    
    if ('keys' in step) {
      Object.entries(step.keys).forEach(([key, location]) => {
        console.log(`   • ${key}: ${location}`);
      });
    }
    
    if ('variables' in step) {
      Object.entries(step.variables).forEach(([key, description]) => {
        console.log(`   • ${key}: ${description}`);
      });
    }
    
    if ('alerts' in step) {
      step.alerts.forEach(alert => {
        console.log(`   • ${alert}`);
      });
    }
    
    console.log('');
  });
  
  console.log('\n🎯 Best Practices:');
  console.log('\n📊 Performance:');
  guide.bestPractices.performance.forEach(practice => {
    console.log(`   • ${practice}`);
  });
  
  console.log('\n🔒 Security:');
  guide.bestPractices.security.forEach(practice => {
    console.log(`   • ${practice}`);
  });
}

function printSummary(isReady: boolean) {
  printHeader('Summary');
  
  if (isReady) {
    console.log('🎉 Your monitoring setup is production ready!');
    console.log('\nNext steps:');
    console.log('1. Deploy to production and verify error tracking works');
    console.log('2. Set up custom alerts in Sentry dashboard');
    console.log('3. Create monitoring dashboards');
    console.log('4. Schedule weekly monitoring reviews');
  } else {
    console.log('⚠️  Your monitoring setup needs attention before production.');
    console.log('\nNext steps:');
    console.log('1. Follow the setup guide above');
    console.log('2. Configure missing environment variables');
    console.log('3. Re-run this script to verify setup');
    console.log('4. Test error tracking in staging environment');
  }
  
  console.log('\n📚 Documentation:');
  console.log('• Setup Guide: ./MONITORING_SETUP.md');
  console.log('• Sentry Docs: https://docs.sentry.io');
  console.log('• Observability Package: ./packages/observability/');
  
  console.log('\n💬 Need Help?');
  console.log('• Review the setup guide in MONITORING_SETUP.md');
  console.log('• Check Sentry documentation for your specific issue');
  console.log('• Contact the engineering team with this output');
}

async function main() {
  printHeader('Threadly Monitoring Setup Validation');
  
  console.log('This script validates your current monitoring setup and provides');
  console.log('actionable feedback for production deployment.\n');
  
  // Run all checks
  await checkEnvironmentVariables();
  checkAppConfigurations();
  const isReady = await checkProductionReadiness();
  
  // Show setup guide if not ready
  if (!isReady) {
    printSetupGuide();
  }
  
  // Print final summary
  printSummary(isReady);
  
  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

// Run the script
main().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});