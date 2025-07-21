#!/usr/bin/env node

// Conditional stripe script for API app
// Only runs stripe listen if stripe CLI is installed

const { execSync } = require('child_process');

try {
  // Check if stripe CLI is installed
  execSync('which stripe', { stdio: 'ignore' });
  execSync('stripe listen --forward-to localhost:3002/webhooks/payments', { stdio: 'inherit' });
} catch (error) {
}