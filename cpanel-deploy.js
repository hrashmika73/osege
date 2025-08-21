#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 cPanel Deployment Helper');
console.log('================================');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ dist directory not found. Run "npm run build:cpanel" first.');
  process.exit(1);
}

// Create deployment instructions
const instructions = `
=================================================
CPANEL DEPLOYMENT INSTRUCTIONS
=================================================

✅ BUILD COMPLETE! Your React app is ready for cPanel.

📁 WHAT TO UPLOAD:
Upload ALL contents of the 'dist' folder to your cPanel public_html directory.

📋 STEP-BY-STEP GUIDE:

1. ACCESS CPANEL FILE MANAGER:
   - Log into your cPanel
   - Open "File Manager"
   - Navigate to public_html folder

2. UPLOAD FILES:
   - Upload ALL files from the 'dist' folder
   - Include the .htaccess file (enable "Show Hidden Files" in File Manager)
   - Maintain the folder structure exactly as shown

3. SET PERMISSIONS (if needed):
   - Files: 644
   - Directories: 755

4. TEST YOUR DEPLOYMENT:
   - Visit your domain: http://yourdomain.com
   - Test navigation between pages
   - Try direct URL access (e.g., yourdomain.com/user-dashboard)

📁 FILE STRUCTURE ON CPANEL:
public_html/
├── index.html                 (Main app file)
├── .htaccess                 (SPA routing config)
├── assets/
│   ├── index-[hash].css      (Styles)
│   ├── index-[hash].js       (JavaScript)
│   └── vendor-[hash].js      (Libraries)
├── manifest.json             (PWA manifest)
└── robots.txt               (SEO file)

🔧 CPANEL REQUIREMENTS:
- Apache with mod_rewrite enabled
- PHP not required (static hosting)
- SSL certificate recommended

🚨 TROUBLESHOOTING:

Issue: "Routes don't work" (404 errors)
Solution: Ensure .htaccess file is uploaded and mod_rewrite is enabled

Issue: "Styles not loading"
Solution: Check file permissions and clear browser cache

Issue: "App doesn't load"
Solution: Check that index.html is in the root of public_html

Issue: "Admin/API routes not working"
Solution: This is a frontend-only deployment. Backend APIs need separate setup.

🔐 SECURITY NOTES:
- Source maps disabled for production
- Console logs removed
- Security headers configured in .htaccess
- Gzip compression enabled

📞 NEED HELP?
- Contact your hosting provider about React/SPA hosting
- Ensure mod_rewrite is enabled
- Check cPanel error logs if issues persist

=================================================
DEPLOYMENT CHECKLIST:
=================================================

□ Built app with: npm run build:cpanel
□ Uploaded all dist/ contents to public_html/
□ Uploaded .htaccess file
□ Set correct file permissions
□ Tested main domain
□ Tested direct route access
□ Cleared browser cache

Happy hosting! 🎉

`;

// Write instructions to file
fs.writeFileSync('CPANEL_DEPLOYMENT_INSTRUCTIONS.txt', instructions);

// Create zip file for easy upload
try {
  console.log('📦 Creating deployment package...');
  
  // Try to create a tar.gz file
  try {
    execSync('cd dist && tar -czf ../kleverinvest-cpanel.tar.gz .', { stdio: 'inherit' });
    console.log('✅ Created: kleverinvest-cpanel.tar.gz');
  } catch (error) {
    console.log('ℹ️  tar not available, trying zip...');
    try {
      execSync('cd dist && zip -r ../kleverinvest-cpanel.zip .', { stdio: 'inherit' });
      console.log('✅ Created: kleverinvest-cpanel.zip');
    } catch (zipError) {
      console.log('ℹ️  Automatic archiving not available. Manually compress the dist/ folder.');
    }
  }
} catch (error) {
  console.log('ℹ️  Could not create archive automatically. You can manually compress the dist/ folder.');
}

// Display summary
console.log('\n🎉 DEPLOYMENT READY!');
console.log('\n📁 Files created:');
console.log('   ✓ dist/ (your built application)');
console.log('   ✓ CPANEL_DEPLOYMENT_INSTRUCTIONS.txt (detailed guide)');

if (fs.existsSync('kleverinvest-cpanel.tar.gz')) {
  console.log('   ✓ kleverinvest-cpanel.tar.gz (ready to upload)');
} else if (fs.existsSync('kleverinvest-cpanel.zip')) {
  console.log('   ✓ kleverinvest-cpanel.zip (ready to upload)');
}

console.log('\n📋 Next steps:');
console.log('1. Read: CPANEL_DEPLOYMENT_INSTRUCTIONS.txt');
console.log('2. Upload dist/ contents to cPanel public_html/');
console.log('3. Test your application');

console.log('\n🚀 Ready for cPanel hosting!');
