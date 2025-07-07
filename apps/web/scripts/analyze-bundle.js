#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return totalSize;
}

// Function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          path: filePath
        });
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not analyze files in ${dirPath}:`, error.message);
  }
  
  return files.sort((a, b) => b.size - a.size);
}

// Main analysis function
function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');
  
  console.log('🔍 Analyzing bundle size...\n');
  
  // Check if build exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Please run "pnpm build" first.');
    process.exit(1);
  }
  
  // Focus on actual deployable assets
  const staticSize = fs.existsSync(staticDir) ? getDirectorySize(staticDir) : 0;
  const serverSize = getDirectorySize(path.join(buildDir, 'server'));
  const relevantSize = staticSize + serverSize;
  
  console.log(`📦 Static assets size: ${formatBytes(staticSize)}`);
  console.log(`📦 Server assets size: ${formatBytes(serverSize)}`);
  console.log(`📦 Relevant bundle size: ${formatBytes(relevantSize)}`);
  
  // Target check
  const targetSizeMB = 50;
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const isUnderTarget = relevantSize < targetSizeBytes;
  
  console.log(`🎯 Target: ${formatBytes(targetSizeBytes)}`);
  console.log(`${isUnderTarget ? '✅' : '❌'} Status: ${isUnderTarget ? 'Under target' : 'Over target'}\n`);
  
  // Analyze largest files
  if (fs.existsSync(staticDir)) {
    console.log('📊 Largest JavaScript files:');
    const jsFiles = analyzeFiles(path.join(staticDir, 'chunks'), /\.js$/);
    jsFiles.slice(0, 10).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} - ${formatBytes(file.size)}`);
    });
    
    console.log('\n📊 Largest CSS files:');
    const cssFiles = analyzeFiles(path.join(staticDir, 'css'), /\.css$/);
    cssFiles.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} - ${formatBytes(file.size)}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 Optimization recommendations:');
  
  if (relevantSize > targetSizeBytes) {
    console.log('  • Bundle is over target size - consider code splitting');
    console.log('  • Remove unused dependencies');
    console.log('  • Enable tree shaking');
    console.log('  • Use dynamic imports for large components');
  } else {
    console.log('  • Bundle size is optimal! ✅');
  }
  
  console.log('  • Enable gzip compression in production');
  console.log('  • Consider using Next.js Image optimization');
  console.log('  • Implement lazy loading for images');
  
  // Performance score
  const performanceScore = Math.max(0, Math.min(100, 
    100 - ((relevantSize - targetSizeBytes / 2) / (targetSizeBytes / 2)) * 50
  ));
  
  console.log(`\n⚡ Performance Score: ${Math.round(performanceScore)}/100`);
  
  return {
    totalSize: relevantSize,
    isUnderTarget,
    performanceScore
  };
}

// Run if called directly
if (require.main === module) {
  try {
    analyzeBundleSize();
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeBundleSize, formatBytes };