#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const validations: ValidationResult[] = [];

async function runCommand(command: string): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { stdout, stderr, code: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      code: error.code || 1,
    };
  }
}

async function validateTypeScript() {
  console.log(chalk.blue('🔍 Checking TypeScript...'));
  const result = await runCommand('pnpm typecheck');
  
  if (result.code === 0) {
    validations.push({
      name: 'TypeScript',
      status: 'pass',
      message: 'No TypeScript errors found',
    });
  } else {
    validations.push({
      name: 'TypeScript',
      status: 'fail',
      message: 'TypeScript errors detected',
      details: result.stderr,
    });
  }
}

async function validateLint() {
  console.log(chalk.blue('🔍 Running linter...'));
  const result = await runCommand('pnpm lint');
  
  if (result.code === 0) {
    validations.push({
      name: 'Linting',
      status: 'pass',
      message: 'No linting errors found',
    });
  } else {
    const errorCount = result.stderr.match(/Found (\d+) errors/)?.[1] || 'unknown';
    validations.push({
      name: 'Linting',
      status: 'fail',
      message: `Found ${errorCount} linting errors`,
      details: 'Run "pnpm lint" for details',
    });
  }
}

async function validateTests() {
  console.log(chalk.blue('🔍 Running tests...'));
  const result = await runCommand('pnpm test');
  
  if (result.code === 0) {
    validations.push({
      name: 'Unit Tests',
      status: 'pass',
      message: 'All tests passed',
    });
  } else {
    validations.push({
      name: 'Unit Tests',
      status: 'fail',
      message: 'Some tests failed',
      details: result.stderr,
    });
  }
}

async function validateBuild() {
  console.log(chalk.blue('🔍 Testing build process...'));
  const result = await runCommand('pnpm build:packages');
  
  if (result.code === 0) {
    validations.push({
      name: 'Build',
      status: 'pass',
      message: 'Build completed successfully',
    });
  } else {
    validations.push({
      name: 'Build',
      status: 'fail',
      message: 'Build failed',
      details: result.stderr,
    });
  }
}

async function validateEnvironment() {
  console.log(chalk.blue('🔍 Checking environment variables...'));
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'BASEHUB_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length === 0) {
    validations.push({
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
    });
  } else {
    validations.push({
      name: 'Environment Variables',
      status: 'warn',
      message: `Missing ${missingEnvVars.length} environment variables`,
      details: `Missing: ${missingEnvVars.join(', ')}`,
    });
  }
}

async function validateDatabase() {
  console.log(chalk.blue('🔍 Checking database connection...'));
  
  try {
    const { database } = await import('@repo/database');
    await database.$queryRaw`SELECT 1`;
    await database.$disconnect();
    
    validations.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Database connection successful',
    });
  } catch (error) {
    validations.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function validateSecurity() {
  console.log(chalk.blue('🔍 Checking for security issues...'));
  
  // Check for any types
  const anyResult = await runCommand('grep -r "any" apps/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next" | grep -v "dist" | wc -l');
  const anyCount = parseInt(anyResult.stdout.trim()) || 0;
  
  // Check for console.log
  const consoleResult = await runCommand('grep -r "console.log" apps/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next" | grep -v "dist" | wc -l');
  const consoleCount = parseInt(consoleResult.stdout.trim()) || 0;
  
  const issues = [];
  if (anyCount > 0) issues.push(`${anyCount} 'any' types found`);
  if (consoleCount > 0) issues.push(`${consoleCount} console.log statements found`);
  
  if (issues.length === 0) {
    validations.push({
      name: 'Security Check',
      status: 'pass',
      message: 'No security issues found',
    });
  } else {
    validations.push({
      name: 'Security Check',
      status: 'warn',
      message: 'Potential security/quality issues found',
      details: issues.join(', '),
    });
  }
}

async function printReport() {
  console.log('\n' + chalk.bold('📊 Production Validation Report'));
  console.log('=' .repeat(50));
  
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;
  
  validations.forEach(validation => {
    let icon = '';
    let color = chalk.white;
    
    switch (validation.status) {
      case 'pass':
        icon = '✅';
        color = chalk.green;
        passCount++;
        break;
      case 'fail':
        icon = '❌';
        color = chalk.red;
        failCount++;
        break;
      case 'warn':
        icon = '⚠️';
        color = chalk.yellow;
        warnCount++;
        break;
    }
    
    console.log(`${icon} ${color(validation.name)}: ${validation.message}`);
    if (validation.details) {
      console.log(chalk.gray(`   ${validation.details}`));
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(chalk.bold('Summary:'));
  console.log(chalk.green(`✅ Passed: ${passCount}`));
  console.log(chalk.yellow(`⚠️  Warnings: ${warnCount}`));
  console.log(chalk.red(`❌ Failed: ${failCount}`));
  
  if (failCount > 0) {
    console.log('\n' + chalk.red.bold('❌ Production validation FAILED'));
    console.log(chalk.red('Please fix all errors before deploying to production.'));
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('\n' + chalk.yellow.bold('⚠️  Production validation passed with warnings'));
    console.log(chalk.yellow('Consider addressing warnings before deploying.'));
  } else {
    console.log('\n' + chalk.green.bold('✅ Production validation PASSED'));
    console.log(chalk.green('Your application is ready for production deployment!'));
  }
}

async function main() {
  console.log(chalk.bold.blue('🚀 Threadly Production Validation'));
  console.log(chalk.gray('Running comprehensive checks...\n'));
  
  await validateEnvironment();
  await validateTypeScript();
  await validateLint();
  await validateTests();
  await validateBuild();
  await validateDatabase();
  await validateSecurity();
  
  await printReport();
}

main().catch(console.error);