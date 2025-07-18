#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Function to get directory size recursively
function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (_error) {}

  return totalSize;
}

// Function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// Function to analyze specific files
function analyzeFiles(dirPath, pattern) {
  const files = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && pattern.test(entry.name)) {
        const filePath = path.join(dirPath, entry.name);
        const stats = fs.statSync(filePath);
        files.push({
          name: entry.name,
          size: stats.size,
          path: filePath,
        });
      }
    }
  } catch (_error) {}

  return files.sort((a, b) => b.size - a.size);
}

// Main analysis function
function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');

  // Check if build exists
  if (!fs.existsSync(buildDir)) {
    process.exit(1);
  }

  // Focus on actual deployable assets
  const staticSize = fs.existsSync(staticDir) ? getDirectorySize(staticDir) : 0;
  const serverSize = getDirectorySize(path.join(buildDir, 'server'));
  const relevantSize = staticSize + serverSize;

  // Target check
  const targetSizeMB = 50;
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const isUnderTarget = relevantSize < targetSizeBytes;

  // Analyze largest files
  if (fs.existsSync(staticDir)) {
    const jsFiles = analyzeFiles(path.join(staticDir, 'chunks'), /\.js$/);
    jsFiles.slice(0, 10).forEach((_file, _index) => {});
    const cssFiles = analyzeFiles(path.join(staticDir, 'css'), /\.css$/);
    cssFiles.slice(0, 5).forEach((_file, _index) => {});
  }

  if (relevantSize > targetSizeBytes) {
  } else {
  }

  // Performance score
  const performanceScore = Math.max(
    0,
    Math.min(
      100,
      100 - ((relevantSize - targetSizeBytes / 2) / (targetSizeBytes / 2)) * 50
    )
  );

  return {
    totalSize: relevantSize,
    isUnderTarget,
    performanceScore,
  };
}

// Run if called directly
if (require.main === module) {
  try {
    analyzeBundleSize();
  } catch (_error) {
    process.exit(1);
  }
}

module.exports = { analyzeBundleSize, formatBytes };
