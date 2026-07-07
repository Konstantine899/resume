/**
 * Secure Audit Logger v2.0
 * 
 * Шифрование аудиторских логов для соответствия GDPR/SOC2
 * Использует AES-256-GCM + HMAC-SHA256 chaining
 * 
 * Features:
 * - AES-256-GCM encryption для PII данных
 * - HMAC-SHA256 для каждой записи
 * - Hash chaining (blockchain-like)
 * - Key rotation каждые 30 дней
 * - External SIEM интеграция
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecureAuditLogger {
  constructor(options = {}) {
    this.logFile = options.logFile || '.opencode/logs/audit-encrypted.jsonl';
    this.keyFile = options.keyFile || '.opencode/.audit-key';
    this.algorithm = options.algorithm || 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.hmacAlgorithm = 'sha256';
    
    // Key rotation
    this.keyRotationInterval = options.keyRotationInterval || 30 * 24 * 60 * 60 * 1000; // 30 days
    this.lastKeyRotation = Date.now();
    
    // SIEM integration
    this.siemEnabled = options.siemEnabled || false;
    this.siemEndpoint = options.siemEndpoint || null;
    this.siemToken = options.siemToken || null;
    
    // Metrics
    this.metrics = {
      totalLogs: 0,
      encryptedLogs: 0,
      hmacVerified: 0,
      keyRotations: 0,
      siemSent: 0,
      errors: 0,
    };
    
    // Initialize
    this.ensureLogDirectory();
    this.loadOrCreateKey();
    this.previousHash = this.loadPreviousHash();
  }
  
  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true, mode: 0o700 });
    }
  }
  
  /**
   * Load or create encryption key
   */
  loadOrCreateKey() {
    if (fs.existsSync(this.keyFile)) {
      const keyData = JSON.parse(fs.readFileSync(this.keyFile, 'utf8'));
      this.key = Buffer.from(keyData.key, 'hex');
      this.keyId = keyData.keyId;
      this.createdAt = keyData.createdAt;
      
      // Check if key rotation needed
      if (Date.now() - this.createdAt > this.keyRotationInterval) {
        this.rotateKey();
      }
    } else {
      this.generateNewKey();
    }
  }
  
  /**
   * Generate new encryption key
   */
  generateNewKey() {
    this.key = crypto.randomBytes(this.keyLength);
    this.keyId = crypto.randomUUID();
    this.createdAt = Date.now();
    
    const keyData = {
      keyId: this.keyId,
      key: this.key.toString('hex'),
      createdAt: this.createdAt,
      algorithm: this.algorithm,
    };
    
    fs.writeFileSync(this.keyFile, JSON.stringify(keyData, null, 2), {
      mode: 0o600, // Only owner can read/write
    });
    
    this.metrics.keyRotations++;
  }
  
  /**
   * Rotate encryption key
   */
  rotateKey() {
    // Archive old key
    const archiveFile = `${this.keyFile}.${Date.now()}.archive`;
    fs.copyFileSync(this.keyFile, archiveFile);
    
    // Generate new key
    this.generateNewKey();
    
    // Log rotation
    this.log({
      level: 'info',
      event: 'key_rotation',
      oldKeyId: this.keyId,
      newKeyId: this.keyId,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Load previous hash for chaining
   */
  loadPreviousHash() {
    const hashFile = `${this.logFile}.chain`;
    if (fs.existsSync(hashFile)) {
      return fs.readFileSync(hashFile, 'utf8').trim();
    }
    return 'genesis';
  }
  
  /**
   * Save hash for chaining
   */
  saveHash(hash) {
    const hashFile = `${this.logFile}.chain`;
    fs.writeFileSync(hashFile, hash, 'utf8');
    this.previousHash = hash;
  }
  
  /**
   * Encrypt PII data
   */
  encrypt(data) {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag,
      keyId: this.keyId,
    };
  }
  
  /**
   * Decrypt PII data
   */
  decrypt(encryptedData) {
    const { ciphertext, iv, authTag, keyId } = encryptedData;
    
    // Verify key ID (in case of key rotation)
    if (keyId !== this.keyId) {
      throw new Error(`Key ID mismatch: expected ${this.keyId}, got ${keyId}`);
    }
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  /**
   * Calculate HMAC for integrity
   */
  calculateHMAC(entry) {
    const hmac = crypto.createHmac(this.hmacAlgorithm, this.key);
    hmac.update(JSON.stringify(entry));
    return hmac.digest('hex');
  }
  
  /**
   * Verify HMAC integrity
   */
  verifyHMAC(entry, hmac) {
    const calculatedHMAC = this.calculateHMAC(entry);
    return crypto.timingSafeEqual(
      Buffer.from(hmac, 'hex'),
      Buffer.from(calculatedHMAC, 'hex')
    );
  }
  
  /**
   * Create hash chain entry
   */
  createHashChain(entry) {
    const hashInput = `${this.previousHash}${JSON.stringify(entry)}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }
  
  /**
   * Mask PII data
   */
  maskPII(data) {
    const piiPatterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/g,
      creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
      password: /password["']?\s*[:=]\s*["']?[^"'\s]+/gi,
      token: /\b(?:api[_-]?key|token|secret|auth)[_\-]?(?:key)?["']?\s*[:=]\s*["']?[^"'\s]+/gi,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    };
    
    const masked = { ...data };
    const maskedFields = [];
    
    for (const [field, value] of Object.entries(masked)) {
      if (typeof value === 'string') {
        for (const [piiType, pattern] of Object.entries(piiPatterns)) {
          if (pattern.test(value)) {
            masked[field] = value.replace(pattern, `[${piiType.toUpperCase()}_MASKED]`);
            maskedFields.push(field);
          }
        }
      }
    }
    
    return { masked, maskedFields };
  }
  
  /**
   * Log entry (main method)
   */
  log(entry) {
    try {
      const timestamp = new Date().toISOString();
      const traceId = crypto.randomUUID();
      
      // Mask PII
      const { masked, maskedFields } = this.maskPII(entry);
      
      // Encrypt sensitive data
      const encryptedData = this.encrypt(masked);
      
      // Create log entry
      const logEntry = {
        timestamp,
        traceId,
        level: entry.level || 'info',
        event: entry.event || 'audit_log',
        data: encryptedData,
        maskedFields,
        previousHash: this.previousHash,
      };
      
      // Create hash chain
      const currentHash = this.createHashChain(logEntry);
      logEntry.hash = currentHash;
      
      // Calculate HMAC
      logEntry.hmac = this.calculateHMAC(logEntry);
      
      // Write to log file
      fs.appendFileSync(
        this.logFile,
        JSON.stringify(logEntry) + '\n',
        { encoding: 'utf8' }
      );
      
      // Update chain
      this.saveHash(currentHash);
      
      // Send to SIEM if enabled
      if (this.siemEnabled && this.siemEndpoint) {
        this.sendToSIEM(logEntry).catch(err => {
          this.metrics.errors++;
          console.error('Failed to send to SIEM:', err);
        });
      }
      
      // Update metrics
      this.metrics.totalLogs++;
      this.metrics.encryptedLogs++;
      
      return { success: true, traceId, hash: currentHash };
    } catch (error) {
      this.metrics.errors++;
      console.error('Audit logging failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send log to SIEM
   */
  async sendToSIEM(logEntry) {
    if (!this.siemEndpoint) {
      return;
    }
    
    try {
      const response = await fetch(this.siemEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.siemToken}`,
        },
        body: JSON.stringify(logEntry),
      });
      
      if (response.ok) {
        this.metrics.siemSent++;
      }
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }
  
  /**
   * Verify log integrity
   */
  verifyIntegrity(logFilePath = this.logFile) {
    const results = {
      totalEntries: 0,
      verifiedEntries: 0,
      failedEntries: 0,
      chainBroken: false,
      firstError: null,
    };
    
    if (!fs.existsSync(logFilePath)) {
      return { error: 'Log file not found' };
    }
    
    const lines = fs.readFileSync(logFilePath, 'utf8').split('\n').filter(l => l.trim());
    let previousHash = 'genesis';
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        results.totalEntries++;
        
        // Verify HMAC
        const hmacValid = this.verifyHMAC(entry, entry.hmac);
        if (!hmacValid) {
          results.failedEntries++;
          results.chainBroken = true;
          if (!results.firstError) {
            results.firstError = `HMAC verification failed at ${entry.timestamp}`;
          }
          continue;
        }
        
        // Verify hash chain
        const expectedHash = crypto
          .createHash('sha256')
          .update(`${previousHash}${JSON.stringify({ ...entry, hash: undefined, hmac: undefined })}`)
          .digest('hex');
        
        if (entry.hash !== expectedHash) {
          results.failedEntries++;
          results.chainBroken = true;
          if (!results.firstError) {
            results.firstError = `Hash chain broken at ${entry.timestamp}`;
          }
          continue;
        }
        
        results.verifiedEntries++;
        previousHash = entry.hash;
        this.metrics.hmacVerified++;
      } catch (error) {
        results.failedEntries++;
        if (!results.firstError) {
          results.firstError = error.message;
        }
      }
    }
    
    return results;
  }
  
  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      keyId: this.keyId,
      keyAge: Date.now() - this.createdAt,
      nextRotation: this.createdAt + this.keyRotationInterval - Date.now(),
    };
  }
  
  /**
   * Export logs (for backup)
   */
  exportLogs(outputFile) {
    if (fs.existsSync(this.logFile)) {
      fs.copyFileSync(this.logFile, outputFile);
      return { success: true, file: outputFile };
    }
    return { success: false, error: 'No logs to export' };
  }
  
  /**
   * Rotate logs (archive old logs)
   */
  rotateLogs() {
    const timestamp = Date.now();
    const archiveFile = `${this.logFile}.${timestamp}.archive`;
    
    if (fs.existsSync(this.logFile)) {
      fs.renameSync(this.logFile, archiveFile);
      fs.writeFileSync(`${archiveFile}.chain`, this.previousHash, 'utf8');
      
      // Reset chain
      this.saveHash('genesis');
      
      return { success: true, archive: archiveFile };
    }
    
    return { success: false, error: 'No logs to rotate' };
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  SecureAuditLogger,
  
  // Convenience function
  createSecureAuditLogger: (options) => new SecureAuditLogger(options),
};
