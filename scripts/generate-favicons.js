#!/usr/bin/env node

/**
 * Favicon Generation Script
 * 
 * This script should be run with a proper image processing tool like:
 * - sharp (npm install sharp)
 * - imagemagick
 * - or any other image conversion tool
 * 
 * Required outputs:
 * - favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
 * - favicon-16x16.png
 * - favicon-32x32.png
 * - apple-touch-icon.png (180x180)
 * - icon-192x192.png (for PWA)
 * - icon-512x512.png (for PWA)
 */

const apps = ['web', 'app'];
const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'icon-192x192.png': 192,
  'icon-512x512.png': 512
};

console.log('Favicon Generation Guide:');
console.log('========================');
console.log('');
console.log('For each app (web and app), generate the following files from icon.svg:');
console.log('');

apps.forEach(app => {
  console.log(`\nFor apps/${app}/public/:`);
  console.log('1. favicon.ico (combine 16x16, 32x32, 48x48 PNGs)');
  
  Object.entries(sizes).forEach(([filename, size]) => {
    console.log(`2. ${filename} (${size}x${size})`);
  });
});

console.log('\n\nUsing ImageMagick:');
console.log('==================');
apps.forEach(app => {
  const basePath = `apps/${app}/public`;
  console.log(`\n# For ${app}:`);
  
  // Generate PNGs
  Object.entries(sizes).forEach(([filename, size]) => {
    console.log(`convert ${basePath}/icon.svg -resize ${size}x${size} ${basePath}/${filename}`);
  });
  
  // Generate favicon.ico
  console.log(`convert ${basePath}/icon.svg -resize 16x16 ${basePath}/favicon-16.png`);
  console.log(`convert ${basePath}/icon.svg -resize 32x32 ${basePath}/favicon-32.png`);
  console.log(`convert ${basePath}/icon.svg -resize 48x48 ${basePath}/favicon-48.png`);
  console.log(`convert ${basePath}/favicon-16.png ${basePath}/favicon-32.png ${basePath}/favicon-48.png ${basePath}/favicon.ico`);
  console.log(`rm ${basePath}/favicon-16.png ${basePath}/favicon-32.png ${basePath}/favicon-48.png`);
});

console.log('\n\nUsing Node.js with sharp:');
console.log('=========================');
console.log('npm install sharp');
console.log('Then run: node scripts/generate-favicons-sharp.js');