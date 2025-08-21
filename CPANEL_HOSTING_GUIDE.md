# cPanel Hosting Guide for React Application

This guide will help you deploy your React application to any cPanel-based hosting provider.

## 🚀 Quick Start

```bash
# 1. Build for cPanel
npm run build:cpanel

# 2. Create deployment package
npm run cpanel:deploy

# 3. Upload to cPanel
# Upload contents of 'dist' folder to public_html
```

## 📋 Prerequisites

### Hosting Requirements
- **cPanel hosting** with Apache server
- **mod_rewrite enabled** (for SPA routing)
- **File upload capability** (FTP/File Manager)
- **Optional**: SSL certificate for HTTPS

### Development Requirements
- Node.js 16+ installed
- npm or yarn package manager

## 🔨 Build Process

### Option 1: Automated Build
```bash
npm run cpanel:deploy
```
This will:
- Build the application for cPanel
- Create deployment instructions
- Generate uploadable archive

### Option 2: Manual Build
```bash
# Build with cPanel configuration
npm run build:cpanel

# Or with custom config
npx vite build --config vite.config.cpanel.js
```

## 📁 File Structure

After building, your `dist` folder will contain:

```
dist/
├── index.html              # Main application entry
├── .htaccess              # Apache configuration for SPA
├── assets/
│   ├── index-[hash].css   # Minified styles
│   ├── index-[hash].js    # Main application bundle
│   ├── vendor-[hash].js   # Third-party libraries
│   └── router-[hash].js   # React Router bundle
├── manifest.json          # PWA manifest
├── robots.txt             # SEO robots file
└── favicon.ico            # Website icon
```

## ☁️ cPanel Upload Methods

### Method 1: File Manager (Recommended)
1. Log into your cPanel
2. Open **File Manager**
3. Navigate to `public_html` folder
4. Upload ALL contents from `dist` folder
5. Ensure `.htaccess` is uploaded (enable "Show Hidden Files")

### Method 2: FTP Client
```bash
# Example with FileZilla or similar FTP client
Host: ftp.yourdomain.com
Username: your-cpanel-username
Password: your-cpanel-password
Directory: /public_html

# Upload all files from dist/ to public_html/
```

### Method 3: cPanel File Upload
1. Zip the `dist` folder contents
2. Upload zip to `public_html` via cPanel
3. Extract the zip file
4. Delete the zip file

## ⚙️ Configuration Details

### .htaccess Configuration
The included `.htaccess` file provides:
- **SPA Routing**: Redirects all routes to `index.html`
- **Gzip Compression**: Reduces file sizes
- **Browser Caching**: Improves performance
- **Security Headers**: Enhances security

### Vite Configuration
The `vite.config.cpanel.js` includes:
- **Relative paths** (`base: './'`)
- **Optimized chunks** for better loading
- **Minification** with Terser
- **Asset optimization**

## 🧪 Testing Your Deployment

### Basic Tests
1. **Homepage**: Visit `http://yourdomain.com`
2. **Navigation**: Click through different pages
3. **Direct URLs**: Try `yourdomain.com/user-dashboard`
4. **Refresh Test**: Refresh on any page (should not show 404)

### Performance Tests
1. **Loading Speed**: Check with browser dev tools
2. **Asset Loading**: Verify CSS/JS files load correctly
3. **Mobile Responsive**: Test on mobile devices

## 🚨 Common Issues & Solutions

### Issue: Routes Return 404
**Cause**: `.htaccess` not uploaded or mod_rewrite disabled

**Solutions**:
- Ensure `.htaccess` file is in `public_html` root
- Contact hosting provider to enable mod_rewrite
- Check file permissions (644 for .htaccess)

### Issue: Styles Not Loading
**Cause**: Incorrect file paths or permissions

**Solutions**:
- Clear browser cache
- Check file permissions (644 for files, 755 for folders)
- Verify all files uploaded correctly

### Issue: App Shows Blank Page
**Cause**: JavaScript errors or missing files

**Solutions**:
- Check browser console for errors
- Verify `index.html` is in public_html root
- Ensure all asset files uploaded

### Issue: API Calls Fail
**Cause**: This is a frontend-only deployment

**Solutions**:
- Set up separate backend hosting
- Update API endpoints in your app
- Use serverless functions if needed

## 🔧 Advanced Configuration

### Custom Domain Setup
1. Point domain to hosting server
2. Set up DNS records
3. Configure SSL certificate
4. Update any hardcoded URLs in app

### Subdirectory Installation
If installing in a subdirectory (e.g., `yourdomain.com/app`):

1. Update `vite.config.cpanel.js`:
```javascript
export default defineConfig({
  base: './app/', // Change this to your subdirectory
  // ... rest of config
});
```

2. Upload to `public_html/app/` instead of `public_html/`

### Environment Variables
For production environment variables:

1. Create `.env.production`:
```
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Your App Name
```

2. Rebuild: `npm run build:cpanel`

## 📊 Performance Optimization

### Enabled Optimizations
- **Gzip compression** via .htaccess
- **Browser caching** for static assets
- **Code splitting** for faster initial load
- **Minification** of all assets
- **Tree shaking** to remove unused code

### Manual Optimizations
- **Image optimization**: Compress images before upload
- **CDN setup**: Use hosting provider's CDN if available
- **SSL certificate**: Enable HTTPS for security and SEO

## 🔐 Security Features

### Included Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (for HTTPS)
- `Referrer-Policy: strict-origin-when-cross-origin`

### Production Security
- Source maps disabled
- Console logs removed
- Debug code stripped
- Environment variables sanitized

## 📞 Support

### Hosting Provider Support
Contact your hosting provider for:
- mod_rewrite enablement
- SSL certificate setup
- Domain configuration
- Server-side issues

### Application Support
For application-specific issues:
- Check browser console for errors
- Verify all files uploaded correctly
- Test in incognito/private mode
- Check file permissions

## 📚 Additional Resources

- [cPanel Documentation](https://docs.cpanel.net/)
- [Apache mod_rewrite Guide](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

---

## 🎉 Deployment Checklist

- [ ] Run `npm run cpanel:deploy`
- [ ] Upload all `dist/` contents to `public_html/`
- [ ] Verify `.htaccess` uploaded
- [ ] Test homepage loads
- [ ] Test navigation works
- [ ] Test direct URL access
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate (if applicable)
- [ ] Test performance
- [ ] Clear browser cache and retest

**Your React app is now live on cPanel hosting! 🚀**
