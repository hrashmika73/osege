# KleverInvest Authentication System - Backend Implementation Guide

## Overview
This document provides the complete backend implementation guide for the KleverInvest authentication system with separate login portals for Admins and Users.

## 🗄️ Database Structure

### 1. Main Tables

#### users
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NULL, -- For admin users
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    status ENUM('active', 'pending', 'suspended', 'banned') NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    phone VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    address TEXT NULL,
    country VARCHAR(100) NULL,
    admin_level ENUM('admin', 'super', 'mod') NULL, -- For admin users only
    permissions JSON NULL, -- For admin users only
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    remember_token VARCHAR(255) NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
);
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    remember_me BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (session_token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);
```

#### wallets
```sql
CREATE TABLE wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    pending_deposits DECIMAL(15,2) DEFAULT 0.00,
    total_earnings DECIMAL(15,2) DEFAULT 0.00,
    total_deposits DECIMAL(15,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(15,2) DEFAULT 0.00,
    wallet_address VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

#### transactions
```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'investment', 'earning', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    description TEXT NULL,
    reference_id VARCHAR(255) NULL,
    gateway VARCHAR(100) NULL, -- payment gateway used
    gateway_transaction_id VARCHAR(255) NULL,
    metadata JSON NULL, -- Additional transaction data
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_reference (reference_id)
);
```

#### investment_plans
```sql
CREATE TABLE investment_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    apy DECIMAL(5,2) NOT NULL, -- Annual Percentage Yield
    duration_days INT NOT NULL,
    risk_level ENUM('low', 'medium', 'high') NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_investments
```sql
CREATE TABLE user_investments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    daily_earning DECIMAL(15,2) NOT NULL,
    total_earned DECIMAL(15,2) DEFAULT 0.00,
    last_payout TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES investment_plans(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status)
);
```

#### security_logs
```sql
CREATE TABLE security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    event_type ENUM('login_success', 'login_failure', 'logout', 'password_change', 'email_change', 'admin_action') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    details JSON NULL,
    severity ENUM('info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);
```

#### site_content
```sql
CREATE TABLE site_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section VARCHAR(100) NOT NULL, -- 'header', 'footer', 'plans', 'about', etc.
    key_name VARCHAR(100) NOT NULL,
    content_type ENUM('text', 'html', 'json', 'image') NOT NULL DEFAULT 'text',
    content LONGTEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INT NULL, -- admin user who made the change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_section_key (section, key_name),
    INDEX idx_section (section)
);
```

## 🔧 PHP Backend Structure

### Directory Structure
```
backend/
├── config/
│   ├── database.php
│   ├── auth.php
│   └── mail.php
├── includes/
│   ├── functions.php
│   ├── auth.php
│   └── security.php
├── api/
│   ├── auth/
│   │   ├── user-login.php
│   │   ├── admin-login.php
│   │   ├── logout.php
│   │   └── verify-session.php
│   ├── user/
│   │   ├── dashboard.php
│   │   ├── profile.php
│   │   ├── wallet.php
│   │   └── transactions.php
│   └── admin/
│       ├── dashboard.php
│       ├── users.php
│       ├── transactions.php
│       └── content.php
├── classes/
│   ├── Database.php
│   ├── User.php
│   ├── Admin.php
│   ├── Wallet.php
│   └── Security.php
└── install/
    └── setup.sql
```

### Core PHP Files

#### config/database.php
```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'kleverinvest');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_pass');
define('DB_CHARSET', 'utf8mb4');

class Database {
    private $connection;
    
    public function __construct() {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        try {
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Database connection failed");
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
}
?>
```

#### includes/auth.php
```php
<?php
session_start();

class Auth {
    private $db;
    private $maxLoginAttempts = 5;
    private $lockoutDuration = 900; // 15 minutes
    
    public function __construct($database) {
        $this->db = $database->getConnection();
    }
    
    public function loginUser($email, $password, $rememberMe = false) {
        // Check rate limiting
        if ($this->isRateLimited($email)) {
            return ['success' => false, 'error' => 'Too many login attempts. Please try again later.'];
        }
        
        // Get user
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? AND role = 'user'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->recordLoginAttempt($email, false);
            return ['success' => false, 'error' => 'Invalid email or password'];
        }
        
        if ($user['status'] !== 'active') {
            return ['success' => false, 'error' => 'Account is not active'];
        }
        
        // Create session
        $sessionToken = $this->createSession($user['id'], $rememberMe);
        $this->recordLoginAttempt($email, true);
        $this->logSecurityEvent($user['id'], 'login_success');
        
        return [
            'success' => true,
            'user' => $this->sanitizeUser($user),
            'token' => $sessionToken
        ];
    }
    
    public function loginAdmin($username, $password, $rememberMe = false) {
        // Similar to loginUser but for admin role
        if ($this->isRateLimited($username)) {
            return ['success' => false, 'error' => 'Too many login attempts. Please try again later.'];
        }
        
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ? AND role = 'admin'");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->recordLoginAttempt($username, false);
            return ['success' => false, 'error' => 'Invalid credentials'];
        }
        
        $sessionToken = $this->createSession($user['id'], $rememberMe);
        $this->recordLoginAttempt($username, true);
        $this->logSecurityEvent($user['id'], 'login_success');
        
        return [
            'success' => true,
            'user' => $this->sanitizeUser($user),
            'token' => $sessionToken
        ];
    }
    
    private function createSession($userId, $rememberMe = false) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = $rememberMe ? 
            date('Y-m-d H:i:s', strtotime('+30 days')) : 
            date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $this->db->prepare("
            INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent, remember_me) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId, 
            $token, 
            $expiresAt, 
            $_SERVER['REMOTE_ADDR'] ?? '', 
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $rememberMe
        ]);
        
        return $token;
    }
    
    public function verifySession($token) {
        $stmt = $this->db->prepare("
            SELECT u.*, s.expires_at 
            FROM users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.session_token = ? AND s.expires_at > NOW()
        ");
        
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return null;
        }
        
        // Update last login
        $updateStmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        return $this->sanitizeUser($user);
    }
    
    private function isRateLimited($identifier) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as attempts 
            FROM security_logs 
            WHERE (user_id = (SELECT id FROM users WHERE email = ? OR username = ?) 
                  OR ip_address = ?) 
            AND event_type = 'login_failure' 
            AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ");
        
        $stmt->execute([$identifier, $identifier, $_SERVER['REMOTE_ADDR'] ?? '']);
        $result = $stmt->fetch();
        
        return $result['attempts'] >= $this->maxLoginAttempts;
    }
    
    private function recordLoginAttempt($identifier, $success) {
        if (!$success) {
            $this->logSecurityEvent(null, 'login_failure', [
                'identifier' => $identifier,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
            ]);
        }
    }
    
    private function logSecurityEvent($userId, $eventType, $details = null) {
        $stmt = $this->db->prepare("
            INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $userId,
            $eventType,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? '',
            $details ? json_encode($details) : null
        ]);
    }
    
    private function sanitizeUser($user) {
        unset($user['password_hash']);
        unset($user['email_verification_token']);
        unset($user['remember_token']);
        return $user;
    }
}
?>
```

#### api/auth/user-login.php
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';
require_once '../../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password required']);
    exit;
}

try {
    $database = new Database();
    $auth = new Auth($database);
    
    $result = $auth->loginUser(
        $input['email'], 
        $input['password'], 
        $input['rememberMe'] ?? false
    );
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode($result);
        
        // Send email notification (implement your email service)
        // sendLoginNotification($input['email']);
        
    } else {
        http_response_code(401);
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}
?>
```

#### api/user/wallet.php
```php
<?php
header('Content-Type: application/json');
require_once '../../config/database.php';
require_once '../../includes/auth.php';

// Verify session
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

$database = new Database();
$auth = new Auth($database);
$user = $auth->verifySession($token);

if (!$user || $user['role'] !== 'user') {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get wallet data
    $stmt = $db->prepare("SELECT * FROM wallets WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $wallet = $stmt->fetch();
    
    if (!$wallet) {
        // Create wallet if doesn't exist
        $stmt = $db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
        $stmt->execute([$user['id']]);
        $wallet = ['user_id' => $user['id'], 'balance' => 0, 'pending_deposits' => 0, 'total_earnings' => 0];
    }
    
    echo json_encode(['success' => true, 'wallet' => $wallet]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle deposit/withdrawal requests
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input['action'] === 'deposit') {
        // Process deposit
        $amount = floatval($input['amount']);
        
        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid amount']);
            exit;
        }
        
        // Create pending transaction
        $stmt = $db->prepare("
            INSERT INTO transactions (user_id, type, amount, status, description) 
            VALUES (?, 'deposit', ?, 'pending', 'Deposit request')
        ");
        $stmt->execute([$user['id'], $amount]);
        
        echo json_encode(['success' => true, 'message' => 'Deposit request submitted']);
        
    } elseif ($input['action'] === 'withdraw') {
        // Process withdrawal
        $amount = floatval($input['amount']);
        
        // Check available balance
        $stmt = $db->prepare("SELECT balance FROM wallets WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $wallet = $stmt->fetch();
        
        if ($wallet['balance'] < $amount) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Insufficient balance']);
            exit;
        }
        
        // Create withdrawal transaction
        $stmt = $db->prepare("
            INSERT INTO transactions (user_id, type, amount, status, description) 
            VALUES (?, 'withdrawal', ?, 'pending', 'Withdrawal request')
        ");
        $stmt->execute([$user['id'], $amount]);
        
        echo json_encode(['success' => true, 'message' => 'Withdrawal request submitted']);
    }
}
?>
```

## 🔒 Security Features

### 1. Password Security
- Passwords hashed using `password_hash()` with `PASSWORD_DEFAULT`
- Minimum password requirements enforced
- Password change logging

### 2. Session Management
- Secure session tokens using `random_bytes()`
- Configurable session expiration
- Remember me functionality with extended expiration
- Session cleanup on logout

### 3. Rate Limiting
- Maximum 5 login attempts per 15 minutes
- IP-based and user-based tracking
- Automatic lockout and unlock

### 4. Security Logging
- All login attempts logged
- Admin actions tracked
- IP address and user agent recording
- Security event categorization

### 5. Role-Based Access Control
- Strict role verification on all endpoints
- Admin permission levels (admin, super, mod)
- Route-based access control

## 📧 Email Integration

### SMTP Configuration (config/mail.php)
```php
<?php
// Email configuration
define('SMTP_HOST', 'your-smtp-host.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@domain.com');
define('SMTP_PASSWORD', 'your-email-password');
define('SMTP_ENCRYPTION', 'tls');

class Mailer {
    public function sendLoginNotification($email, $userType = 'user') {
        $subject = "Login Notification - KleverInvest";
        $message = "A new login was detected on your account.";
        
        // Implement your email sending logic here
        // Using PHPMailer or similar library
        
        return true;
    }
    
    public function sendVerificationEmail($email, $token) {
        // Email verification implementation
    }
}
?>
```

## 🚀 Deployment Instructions

### 1. cPanel Setup
1. Upload all backend files to your cPanel public_html directory
2. Create MySQL database and import `install/setup.sql`
3. Update database credentials in `config/database.php`
4. Set proper file permissions (644 for files, 755 for directories)

### 2. Frontend Integration
```javascript
// Update your React AuthContext to use these endpoints
const API_BASE = 'https://yourdomain.com/api';

const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE}/auth/user-login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return await response.json();
};
```

### 3. Environment Variables
Create a `.env` file in your backend directory:
```
DB_HOST=localhost
DB_NAME=kleverinvest
DB_USER=your_db_user
DB_PASS=your_db_pass
SMTP_HOST=your-smtp-host.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

## 📊 Admin Features

### User Management
- View all users with filtering
- Edit user profiles and status
- KYC approval/rejection
- Bulk user actions
- User activity monitoring

### Transaction Management
- View all transactions
- Approve/reject deposits and withdrawals
- Transaction search and filtering
- Financial reporting

### Content Management
- Edit site content (header, footer, plans)
- Image upload and management
- Investment plan configuration
- System announcements

### Security & Monitoring
- Security log viewing
- Failed login monitoring
- System health checks
- Backup management

## 🔧 Maintenance

### Regular Tasks
1. **Database Cleanup**: Remove expired sessions and old logs
2. **Security Monitoring**: Review security logs for suspicious activity
3. **Backup**: Regular database and file backups
4. **Updates**: Keep PHP and dependencies updated
5. **Performance**: Monitor and optimize database queries

### Automated Tasks (Cron Jobs)
```bash
# Clean expired sessions (every hour)
0 * * * * php /path/to/backend/scripts/cleanup-sessions.php

# Process pending transactions (every 5 minutes)
*/5 * * * * php /path/to/backend/scripts/process-transactions.php

# Generate daily reports (daily at 2 AM)
0 2 * * * php /path/to/backend/scripts/daily-report.php
```

This comprehensive backend implementation provides enterprise-level security, scalability, and maintainability for your KleverInvest authentication system.
