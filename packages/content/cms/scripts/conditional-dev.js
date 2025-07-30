#!/usr/bin/env node

// Conditional dev script for CMS package
// Only runs basehub dev if BASEHUB_TOKEN is available

const { execSync } = require('child_process');

if (process.env.BASEHUB_TOKEN) {
  try {
    execSync('basehub dev', { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
} else {
  // Keep the process running so Turborepo doesn't think it failed
  setInterval(() => {}, 1000);
}
