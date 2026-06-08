# 🔒 Security Rules - Senior Security Architect Level

## 🚫 ABSOLUTE SECURITY BANS (Auto-fail)

### 1. DATA PROTECTION:

- ❌ **NO** sensitive data in code (passwords, keys, tokens)
- ❌ **NO** console.log in production code
- ❌ **NO** unprotected user data storage
- ❌ **NO** missing input validation/sanitization

### 2. AUTHENTICATION:

- ❌ **NO** hardcoded credentials
- ❌ **NO** weak password policies
- ❌ **NO** missing CSRF protection
- ❌ **NO** JWT security misconfigurations

### 3. API SECURITY:

- ❌ **NO** unprotected API endpoints
- ❌ **NO** missing rate limiting
- ❌ **NO** SQL/NoSQL injection vulnerabilities
- ❌ **NO** XSS vulnerabilities in components

## ⚠️ SECURITY REQUIREMENTS (Must Have)

### 1. INPUT VALIDATION:

- ✅ **ALL** user inputs must be validated
- ✅ **ALL** API responses must be sanitized
- ✅ **ALL** file uploads must be scanned
- ✅ **ALL** data exports must be encrypted

### 2. AUTHENTICATION:

- ✅ **MUST** use secure password hashing (bcrypt)
- ✅ **MUST** implement proper session management
- ✅ **MUST** use HTTPS in production
- ✅ **MUST** implement proper CORS policies

### 3. DATA PROTECTION:

- ✅ **ALL** sensitive data must be encrypted
- ✅ **ALL** environment variables must be validated
- ✅ **ALL** third-party libs must be security audited
- ✅ **ALL** dependencies must be regularly updated

## 🎯 SECURITY METRICS (SaaS Advanced)

### 1. VULNERABILITY SCORING:

- **CVSS Score**: < 4.0 (Low) for all dependencies
- **Snyk Score**: A+ rating required
- **OWASP ZAP**: Zero critical vulnerabilities
- **CodeQL**: Zero security findings

### 2. COMPLIANCE STANDARDS:

- ✅ **GDPR** compliance for user data
- ✅ **SOC 2** Type II readiness
- ✅ **ISO 27001** security practices
- ✅ **OWASP Top 10** 2021 compliance

### 3. MONITORING & RESPONSE:

- ✅ **Real-time** security monitoring
- ✅ **Automated** vulnerability scanning
- ✅ **Incident** response plan in place
- ✅ **Security** training for developers

## 🔧 SECURITY AUTOMATION

### 1. PRE-COMMIT CHECKS:

- 🔍 **Secret scanning** (git-secrets, truffleHog)
- 🔍 **Dependency vulnerability** scanning
- 🔍 **SAST** (Static Application Security Testing)
- 🔍 **License compliance** checking

### 2. CI/CD PIPELINE:

- ✅ **Security** gates in CI pipeline
- ✅ **Automated** penetration testing
- ✅ **Container** security scanning
- ✅ **Infrastructure** as Code security

### 3. PRODUCTION MONITORING:

- 📊 **Real-time** threat detection
- 📊 **Anomaly** detection systems
- 📊 **Security** information and event management (SIEM)
- 📊 **Regular** security audits

## 🚨 CRITICAL SECURITY PATTERNS

### 1. DEFENSE IN DEPTH:

- 🛡️ **Multiple** security layers
- 🛡️ **Zero-trust** architecture
- 🛡️ **Principle** of least privilege
- 🛡️ **Secure** defaults everywhere

### 2. SECURE DEVELOPMENT:

- 🔐 **Shift-left** security approach
- 🔐 **Security** champion program
- 🔐 **Threat** modeling for all features
- 🔐 **Secure** code reviews mandatory

### 3. INCIDENT RESPONSE:

- 🚨 **Documented** response procedures
- 🚨 **Regular** security drills
- 🚨 **24/7** security on-call rotation
- 🚨 **Post-incident** analysis required

## 📊 SECURITY QUALITY GATES

### ✅ AUTOMATIC APPROVAL:

- Zero critical vulnerabilities
- 100% security test coverage
- All dependencies patched
- No security debt

### ❌ AUTOMATIC REJECTION:

- Any critical vulnerability
- Missing security headers
- Exposed secrets in code
- Failed security scans

---

**Security Rules enforced at Senior SaaS Advanced level** 🔒
