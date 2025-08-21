# KleverInvest Hub - Production Deployment Guide

This guide will help you deploy KleverInvest Hub to a live server with a real database.

## 🚀 Production Setup Steps

### 1. Environment Configuration

Copy the production environment file:
```bash
cp .env.production .env
```

### 2. Database Setup Options

#### Option A: Supabase (Recommended - Quick Setup)

1. Create account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your project URL and API keys
4. Update `.env` file:
   ```env
   VITE_DB_TYPE=supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_KEY=your-service-key
   ```

5. Create tables in Supabase SQL Editor:
   ```sql
   -- Users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     user_id VARCHAR(50) UNIQUE,
     username VARCHAR(100),
     email VARCHAR(255) UNIQUE NOT NULL,
     full_name VARCHAR(255),
     password VARCHAR(255),
     status VARCHAR(20) DEFAULT 'active',
     last_active TIMESTAMP,
     registration_date TIMESTAMP DEFAULT NOW(),
     total_investments DECIMAL(12,2) DEFAULT 0,
     balance DECIMAL(12,2) DEFAULT 0,
     kyc_status VARCHAR(20) DEFAULT 'pending',
     verification_status VARCHAR(20) DEFAULT 'pending',
     location VARCHAR(100),
     phone VARCHAR(20),
     risk_level VARCHAR(10) DEFAULT 'medium',
     referral_code VARCHAR(20),
     account_type VARCHAR(20) DEFAULT 'standard',
     two_factor_enabled BOOLEAN DEFAULT false,
     email_verified BOOLEAN DEFAULT false,
     profile_complete BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- KYC requests table
   CREATE TABLE kyc_requests (
     id SERIAL PRIMARY KEY,
     user_id VARCHAR(50),
     username VARCHAR(100),
     email VARCHAR(255),
     full_name VARCHAR(255),
     submission_date TIMESTAMP DEFAULT NOW(),
     document_type VARCHAR(50),
     document_number VARCHAR(100),
     country VARCHAR(100),
     phone_number VARCHAR(20),
     address TEXT,
     priority VARCHAR(20) DEFAULT 'normal',
     investment_amount DECIMAL(12,2) DEFAULT 0,
     risk_level VARCHAR(10) DEFAULT 'medium',
     documents_submitted JSONB,
     verification_status VARCHAR(20) DEFAULT 'pending',
     status VARCHAR(20) DEFAULT 'pending',
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

   -- Create policies (adjust as needed)
   CREATE POLICY "Allow all operations for authenticated users" ON users
     FOR ALL USING (auth.role() = 'authenticated');
   
   CREATE POLICY "Allow all operations for authenticated users" ON kyc_requests
     FOR ALL USING (auth.role() = 'authenticated');
   ```

#### Option B: Self-Hosted Database

1. Set up PostgreSQL/MySQL server
2. Create database and tables (use schema from Option A)
3. Create backend API (Node.js/Express, Python/Django, etc.)
4. Update `.env` file:
   ```env
   VITE_DB_TYPE=postgresql
   VITE_API_URL=https://your-api-domain.com/api
   VITE_ENABLE_BACKEND=true
   ```

### 3. Payment Gateway Setup

#### Stripe (Recommended)
1. Create Stripe account
2. Get live API keys
3. Update `.env`:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-live-key
   ```

#### PayPal
1. Create PayPal Business account
2. Get live client ID
3. Update `.env`:
   ```env
   VITE_PAYPAL_CLIENT_ID=your-paypal-live-client-id
   ```

### 4. Security Configuration

1. Generate secure JWT secret:
   ```bash
   openssl rand -base64 64
   ```

2. Update `.env`:
   ```env
   VITE_JWT_SECRET=your-generated-jwt-secret
   VITE_FORCE_HTTPS=true
   VITE_SECURE_COOKIES=true
   ```

### 5. Email Service Setup

#### SendGrid (Recommended)
1. Create SendGrid account
2. Get API key
3. Verify domain
4. Update `.env`:
   ```env
   VITE_EMAIL_SERVICE=sendgrid
   VITE_SENDGRID_API_KEY=your-sendgrid-api-key
   VITE_FROM_EMAIL=noreply@yourdomain.com
   ```

### 6. Company Information

Update all company details in `.env`:
```env
VITE_COMPANY_NAME=Your Company LLC
VITE_COMPANY_ADDRESS=Your Business Address
VITE_COMPANY_PHONE=+1-555-YOUR-PHONE
VITE_COMPANY_EMAIL=info@yourdomain.com
VITE_COMPANY_WEBSITE=https://yourdomain.com
```

### 7. Build for Production

```bash
npm run build
```

### 8. Deploy to Server

#### Option A: Netlify/Vercel (Static Hosting)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in hosting dashboard

#### Option B: VPS/Dedicated Server
1. Upload `dist` folder to web server
2. Configure Nginx/Apache
3. Set up SSL certificate
4. Configure environment variables

### 9. Admin Account Setup

Since mock data is removed, you'll need to create an admin account:

1. Register through the normal registration flow
2. Manually update the user in your database:
   ```sql
   UPDATE users SET 
     status = 'admin',
     account_type = 'admin',
     email_verified = true,
     profile_complete = true
   WHERE email = 'your-admin-email@domain.com';
   ```

Or create directly in database:
```sql
INSERT INTO users (
  user_id, username, email, full_name, password, 
  status, account_type, email_verified, profile_complete
) VALUES (
  'admin_001', 'admin', 'admin@yourdomain.com', 'System Administrator',
  'your-hashed-password', 'admin', 'admin', true, true
);
```

## 🔒 Security Checklist

- [ ] All environment variables use production values
- [ ] Database uses strong passwords
- [ ] SSL/TLS certificates configured
- [ ] JWT secret is cryptographically secure
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] Regular security updates

## 📊 Monitoring Setup

1. **Google Analytics**: Add your tracking ID to `.env`
2. **Error Monitoring**: Consider Sentry or similar
3. **Uptime Monitoring**: Set up server monitoring
4. **Database Backups**: Configure automated backups

## 🎯 Post-Deployment

1. Test all functionality:
   - User registration
   - KYC submission
   - Admin login
   - Payment processing
   - Email sending

2. Load testing with expected user volume
3. Security scan/penetration testing
4. Backup and disaster recovery testing

## 🆘 Troubleshooting

**Database Connection Issues:**
- Check credentials and network access
- Verify database server is running
- Test connection from deployment server

**Payment Issues:**
- Verify API keys are correct
- Check webhook endpoints
- Test in sandbox mode first

**Email Issues:**
- Verify domain authentication
- Check spam filters
- Test with different email providers

## 📞 Support

For technical issues with the KleverInvest Hub application:
1. Check the console for error messages
2. Verify environment configuration
3. Test database connectivity
4. Review server logs

---

**Note**: This application is now production-ready with all debug tools, mock data, and test utilities removed.
