#!/bin/bash

# cPanel Deployment Script for React App
# This script prepares the React app for cPanel hosting

echo "🚀 Starting cPanel deployment preparation..."

# Check if we have Node.js and npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create production build using cPanel config
echo "🔨 Building for cPanel..."
npm run build:cpanel

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment instructions
cat > CPANEL_DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
=================================================
CPANEL DEPLOYMENT INSTRUCTIONS
=================================================

1. UPLOAD FILES TO CPANEL:
   - Upload ALL contents of the 'dist' folder to your cPanel public_html directory
   - Make sure to upload the .htaccess file as well (enable "Show hidden files" in File Manager)

2. CPANEL REQUIREMENTS:
   - Ensure your hosting supports:
     * Apache mod_rewrite (for SPA routing)
     * mod_deflate and mod_expires (for performance)
     * mod_headers (for security headers)

3. FILE STRUCTURE ON CPANEL:
   public_html/
   ├── index.html
   ├── .htaccess
   ├── assets/
   │   ├── index-[hash].css
   │   └── index-[hash].js
   ├── manifest.json
   └── robots.txt

4. TESTING:
   - Visit your domain after upload
   - Test navigation between pages
   - Check that direct URL access works (e.g., yourdomain.com/user-dashboard)
   - Verify that 404 errors redirect to the main app

5. TROUBLESHOOTING:
   - If routing doesn't work: Check .htaccess file is uploaded and mod_rewrite is enabled
   - If assets don't load: Verify file permissions (644 for files, 755 for directories)
   - If styles are broken: Clear browser cache and check CSS file paths

6. PERFORMANCE OPTIMIZATION:
   - Gzip compression is enabled via .htaccess
   - Browser caching is configured for static assets
   - Assets are minified and optimized

7. SECURITY:
   - Security headers are configured in .htaccess
   - Console logs are removed from production build
   - Source maps are disabled for security

=================================================
SUPPORT NOTES:
=================================================

- This is a Single Page Application (SPA)
- All routes are handled client-side by React Router
- The .htaccess file redirects all non-file requests to index.html
- Static assets are cached for 1 year for performance
- HTML files are not cached to ensure updates are immediate

For additional support, check your cPanel hosting documentation
or contact your hosting provider about React/SPA hosting requirements.
EOF

echo "📋 Deployment instructions created: CPANEL_DEPLOYMENT_INSTRUCTIONS.txt"

# Create a zip file for easy upload
if command -v zip &> /dev/null; then
    echo "📦 Creating deployment zip file..."
    cd dist
    zip -r ../kleverinvest-cpanel-deployment.zip . -x "*.DS_Store" "*.git*"
    cd ..
    echo "✅ Deployment zip created: kleverinvest-cpanel-deployment.zip"
else
    echo "ℹ️  zip command not available. You can manually zip the dist folder contents."
fi

# Create FTP upload script template
cat > ftp-upload-template.sh << 'EOF'
#!/bin/bash

# FTP Upload Script Template
# Replace the variables below with your actual cPanel FTP details

FTP_HOST="ftp.yourdomain.com"
FTP_USER="your-username"
FTP_PASS="your-password"
REMOTE_DIR="/public_html"
LOCAL_DIR="./dist"

echo "Uploading to cPanel via FTP..."

# Using lftp for the upload (install with: apt-get install lftp or brew install lftp)
if command -v lftp &> /dev/null; then
    lftp -c "
    set ssl:verify-certificate false;
    open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
    mirror --reverse --delete --verbose $LOCAL_DIR $REMOTE_DIR;
    bye
    "
    echo "✅ Upload completed!"
else
    echo "❌ lftp not found. Please install lftp or use your preferred FTP client."
    echo "Upload the contents of the 'dist' folder to your public_html directory."
fi
EOF

chmod +x ftp-upload-template.sh

echo ""
echo "🎉 cPanel deployment preparation complete!"
echo ""
echo "📁 Files ready for upload:"
echo "   - dist/ (contains your built application)"
echo "   - CPANEL_DEPLOYMENT_INSTRUCTIONS.txt (detailed instructions)"
echo "   - kleverinvest-cpanel-deployment.zip (ready to upload)"
echo "   - ftp-upload-template.sh (FTP upload script template)"
echo ""
echo "Next steps:"
echo "1. Read CPANEL_DEPLOYMENT_INSTRUCTIONS.txt"
echo "2. Upload dist/ contents to your cPanel public_html directory"
echo "3. Test your application"
echo ""
echo "🚀 Happy deploying!"
