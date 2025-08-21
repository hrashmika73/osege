-- KleverInvest Hub Database Seed Data
-- Initial data for development and testing

-- Insert investment plans
INSERT INTO investment_plans (plan_code, name, description, min_amount, max_amount, expected_return_min, expected_return_max, duration_days, risk_level, management_fee, features, crypto_allocation, is_active, recommended) VALUES
('STARTER', 'Starter Plan', 'Perfect for beginners looking to start their crypto investment journey with lower risk and steady returns.', 100.00, 1000.00, 6.00, 12.00, 30, 'low', 1.5, 
 '["24/7 Support", "Mobile App Access", "Basic Analytics", "Monthly Reports"]'::jsonb,
 '{"bitcoin": 60, "ethereum": 30, "stablecoins": 10}'::jsonb, true, true),

('PROFESSIONAL', 'Professional Plan', 'Balanced approach with moderate risk for experienced investors seeking consistent growth.', 1000.00, 10000.00, 12.00, 20.00, 60, 'medium', 2.0,
 '["24/7 Support", "Mobile App Access", "Advanced Analytics", "Weekly Reports", "Personal Account Manager", "Priority Withdrawals"]'::jsonb,
 '{"bitcoin": 50, "ethereum": 35, "altcoins": 10, "stablecoins": 5}'::jsonb, true, true),

('ELITE', 'Elite Plan', 'High-yield opportunities for serious investors comfortable with higher risk for maximum returns.', 5000.00, 100000.00, 20.00, 35.00, 90, 'high', 2.5,
 '["24/7 VIP Support", "Mobile App Access", "Premium Analytics", "Daily Reports", "Dedicated Account Manager", "Instant Withdrawals", "Exclusive Investment Opportunities", "Risk Management Tools"]'::jsonb,
 '{"bitcoin": 40, "ethereum": 30, "altcoins": 25, "stablecoins": 5}'::jsonb, true, false);

-- Insert default admin user
INSERT INTO admins (email, password_hash, username, full_name, role, permissions, security_level, two_factor_enabled) VALUES
('admin@kleverinvest.com', '$2b$10$dummy.hash.for.admin.password', 'admin', 'System Administrator', 'super_admin', 
 '["user_management", "transaction_management", "kyc_approval", "system_settings", "audit_logs", "support_management"]'::jsonb, 'high', true);

-- Insert sample users (for testing - remove in production)
INSERT INTO users (email, password_hash, username, first_name, last_name, full_name, phone, country, status, email_verified, kyc_status, referral_code, balance, account_type) VALUES
('user@kleverinvest.com', '$2b$10$dummy.hash.for.user.password', 'testuser', 'Test', 'User', 'Test User', '+1234567890', 'United States', 'active', true, 'approved', 'REF000001', 5000.00, 'standard'),
('investor@kleverinvest.com', '$2b$10$dummy.hash.for.investor.password', 'investor', 'John', 'Investor', 'John Investor', '+1987654321', 'Canada', 'active', true, 'approved', 'REF000002', 15000.00, 'premium'),
('demo@kleverinvest.com', '$2b$10$dummy.hash.for.demo.password', 'demouser', 'Demo', 'Account', 'Demo Account', '+1555000111', 'United Kingdom', 'active', true, 'pending', 'REF000003', 0.00, 'standard');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('site_name', '"KleverInvest Hub"', 'Website name', true),
('site_description', '"Premier Cryptocurrency Investment Platform"', 'Website description', true),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', false),
('registration_enabled', 'true', 'Allow new user registrations', false),
('kyc_required', 'true', 'Require KYC verification for investments', false),
('min_deposit', '100', 'Minimum deposit amount in USD', true),
('max_deposit', '100000', 'Maximum deposit amount in USD', true),
('min_withdrawal', '50', 'Minimum withdrawal amount in USD', true),
('withdrawal_fee_percentage', '2.5', 'Withdrawal fee percentage', true),
('referral_commission_percentage', '10', 'Referral commission percentage', true),
('supported_cryptocurrencies', '["BTC", "ETH", "USDT", "USDC", "BNB"]', 'List of supported cryptocurrencies', true),
('contact_email', '"support@kleverinvest.com"', 'Support contact email', true),
('company_address', '"123 Investment Street, Crypto City, CC 12345"', 'Company address', true),
('trading_hours', '"24/7"', 'Trading hours', true),
('security_features', '["2FA", "SSL", "Cold Storage", "Insurance"]', 'Security features list', true);

-- Insert sample market data
INSERT INTO market_data (symbol, price_usd, change_24h, volume_24h, market_cap) VALUES
('BTC', 45000.00, 2.5, 25000000000.00, 850000000000.00),
('ETH', 3000.00, 1.8, 15000000000.00, 360000000000.00),
('USDT', 1.00, 0.0, 50000000000.00, 95000000000.00),
('USDC', 1.00, 0.0, 8000000000.00, 45000000000.00),
('BNB', 350.00, -0.5, 2000000000.00, 55000000000.00);

-- Insert sample notifications for test users
INSERT INTO notifications (user_id, title, message, type, category, priority, action_required, action_url) 
SELECT 
    u.id,
    'Welcome to KleverInvest Hub!',
    'Thank you for joining our platform. Complete your KYC verification to start investing.',
    'welcome',
    'onboarding',
    'medium',
    true,
    '/kyc-verification'
FROM users u WHERE u.email = 'demo@kleverinvest.com';

INSERT INTO notifications (user_id, title, message, type, category, priority, action_required) 
SELECT 
    u.id,
    'Investment Opportunity',
    'New high-yield investment plan available. Check out our Elite Plan for maximum returns.',
    'investment',
    'promotions',
    'low',
    false
FROM users u WHERE u.kyc_status = 'approved';

-- Insert sample user investment for approved users
INSERT INTO user_investments (user_id, plan_id, investment_amount, current_value, total_earnings, maturity_date, status)
SELECT 
    u.id,
    p.id,
    2500.00,
    2750.00,
    250.00,
    NOW() + INTERVAL '30 days',
    'active'
FROM users u, investment_plans p 
WHERE u.email = 'user@kleverinvest.com' AND p.plan_code = 'STARTER';

INSERT INTO user_investments (user_id, plan_id, investment_amount, current_value, total_earnings, maturity_date, status)
SELECT 
    u.id,
    p.id,
    8000.00,
    9200.00,
    1200.00,
    NOW() + INTERVAL '60 days',
    'active'
FROM users u, investment_plans p 
WHERE u.email = 'investor@kleverinvest.com' AND p.plan_code = 'PROFESSIONAL';

-- Insert sample transactions
INSERT INTO transactions (transaction_code, user_id, type, amount, cryptocurrency, usd_value, status, payment_method, network, confirmations)
SELECT 
    'TXN-' || TO_CHAR(NOW(), 'YYYY') || '-001',
    u.id,
    'deposit',
    5000.00,
    'BTC',
    5000.00,
    'completed',
    'Bitcoin',
    'Bitcoin',
    6
FROM users u WHERE u.email = 'user@kleverinvest.com';

INSERT INTO transactions (transaction_code, user_id, type, amount, cryptocurrency, usd_value, status, payment_method, network, confirmations)
SELECT 
    'TXN-' || TO_CHAR(NOW(), 'YYYY') || '-002',
    u.id,
    'investment',
    2500.00,
    'USD',
    2500.00,
    'completed',
    'Internal',
    'Internal',
    1
FROM users u WHERE u.email = 'user@kleverinvest.com';

INSERT INTO transactions (transaction_code, user_id, type, amount, cryptocurrency, usd_value, status, payment_method, network)
SELECT 
    'TXN-' || TO_CHAR(NOW(), 'YYYY') || '-003',
    u.id,
    'profit',
    250.00,
    'USD',
    250.00,
    'completed',
    'Auto-Generated',
    'Internal'
FROM users u WHERE u.email = 'user@kleverinvest.com';

-- Insert sample KYC request for pending user
INSERT INTO kyc_requests (user_id, document_type, document_number, submission_date, verification_status, notes, priority)
SELECT 
    u.id,
    'passport',
    'P123456789',
    NOW(),
    'pending',
    'New user KYC submission awaiting review',
    'medium'
FROM users u WHERE u.email = 'demo@kleverinvest.com';

-- Insert referral relationships
INSERT INTO referrals (referrer_id, referred_id, referral_code, commission_rate, total_commission, status)
SELECT 
    u1.id,
    u2.id,
    u1.referral_code,
    10.00,
    25.00,
    'active'
FROM users u1, users u2 
WHERE u1.email = 'user@kleverinvest.com' 
AND u2.email = 'demo@kleverinvest.com';

-- Insert sample support message
INSERT INTO support_messages (user_id, ticket_id, subject, message, category, priority, status)
SELECT 
    u.id,
    'TICKET-' || LPAD(EXTRACT(epoch FROM NOW())::text, 10, '0'),
    'Question about investment plans',
    'Hi, I would like to know more about the differences between your investment plans. Can you provide more details about the risk levels?',
    'investment_inquiry',
    'medium',
    'open'
FROM users u WHERE u.email = 'demo@kleverinvest.com';

-- Create audit log entry for admin creation
INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, new_values, ip_address)
SELECT 
    a.id,
    'admin_created',
    'admin',
    a.id,
    jsonb_build_object(
        'email', a.email,
        'username', a.username,
        'role', a.role
    ),
    '127.0.0.1'::inet
FROM admins a WHERE a.email = 'admin@kleverinvest.com';

-- Update user balances based on transactions
UPDATE users SET 
    balance = (
        SELECT COALESCE(SUM(
            CASE 
                WHEN t.type IN ('deposit', 'profit', 'referral') THEN t.amount
                WHEN t.type IN ('withdrawal', 'investment', 'fee') THEN -t.amount
                ELSE 0
            END
        ), 0)
        FROM transactions t 
        WHERE t.user_id = users.id 
        AND t.status = 'completed'
    ),
    total_invested = (
        SELECT COALESCE(SUM(investment_amount), 0)
        FROM user_investments 
        WHERE user_id = users.id
    ),
    total_earnings = (
        SELECT COALESCE(SUM(total_earnings), 0)
        FROM user_investments 
        WHERE user_id = users.id
    );
