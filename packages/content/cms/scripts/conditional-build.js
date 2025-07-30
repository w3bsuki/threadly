#!/usr/bin/env node

// Conditional build script for CMS package
// Only runs basehub build if BASEHUB_TOKEN is available

const { execSync } = require('child_process');

if (process.env.BASEHUB_TOKEN) {
  try {
    execSync('basehub build', { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
} else {
}
