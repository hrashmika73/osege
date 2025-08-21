#!/usr/bin/env node

/**
 * Safe build script that handles missing network dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting safe build process...');

// 1. Check for problematic imports and comment them out temporarily
const filesToCheck = [
  'src/config/database.js',
  'src/services/databaseService.js'
];

const backups = {};

function commentOutSupabaseImports() {
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      backups[filePath] = content;
      
      // Comment out problematic import
      const safeContent = content.replace(
        /await import\(['"`]@supabase\/supabase-js['"`]\)/g,
        'await Promise.reject(new Error("Supabase not available"))'
      );
      
      fs.writeFileSync(filePath, safeContent);
      console.log(`📝 Temporarily modified ${filePath}`);
    }
  });
}

function restoreOriginalFiles() {
  Object.entries(backups).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log(`🔄 Restored ${filePath}`);
  });
}

try {
  // 2. Temporarily modify files
  commentOutSupabaseImports();
  
  // 3. Run the build
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // 4. Always restore original files
  restoreOriginalFiles();
  console.log('🧹 Cleanup completed');
}

console.log('🎉 Safe build process completed!');
