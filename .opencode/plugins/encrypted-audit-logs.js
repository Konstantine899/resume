/**
 * Encrypted Audit Logs Plugin
 * Version: 1.0.0
 * 
 * Шифрование аудиторских логов для соответствия GDPR/SOC2
 * Использует AES-256-GCM
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EncryptedAuditLogger {
  constructor(options = {}) {
    this.logFile = options.logFile || '.opencode/logs/audit-encrypted.jsonl';
    this.keyFile = options.keyFile || '.opencode/.audit-key';
    this.algorithm = options.algorithm || 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    
    this.metrics = {
      totalLogs: 0,
      encryptedLogs: 0,
      failedEncryptions: 0,
      keyRotations: 0
    };
    
    this.key = null;
    
    this._ensureDirectory();
    this._loadOrGenerateKey();
    
    console.log('[EncryptedAudit] Initialized (algorithm: ' + this.algorithm + ')');
  }
  
  _ensureDirectory() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Загрузка или генерация ключа
   */
  _loadOrGenerateKey() {
    try {
      if (fs.existsSync(this.keyFile)) {
        const keyData = fs.readFileSync(this.keyFile, 'utf8');
        this.key = Buffer.from(keyData, 'hex');
        console.log('[EncryptedAudit] Key loaded');
      } else {
        this._generateKey();
      }
    } catch (error) {
      console.error('[EncryptedAudit] Key load failed:', error.message);
      this._generateKey();
    }
  }
  
  /**
   * Генерация нового ключа
   */
  _generateKey() {
    this.key = crypto.randomBytes(this.keyLength);
    
    try {
      fs.writeFileSync(this.keyFile, this.key.toString('hex'), 'utf8');
      
      // OS-aware key protection
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        // Windows: Use icacls для установки прав
        try {
          const { execSync } = require('child_process');
          const username = process.env.USERNAME || process.env.USER || 'Administrators';
          // Запретить наследование, дать права только текущему пользователю
          execSync(`icacls "${this.keyFile}" /inheritance:r /grant:r "${username}:(R)" 2>nul`, {
            stdio: 'ignore',
            windowsHide: true
          });
          console.log('[EncryptedAudit] Key secured with icacls (Windows)');
        } catch (chmodError) {
          console.warn('[EncryptedAudit] icacls failed, key saved without ACL:', chmodError.message);
        }
      } else {
        // Unix/Linux/macOS: стандартный chmod
        fs.chmodSync(this.keyFile, 0o600);
        console.log('[EncryptedAudit] Key secured with chmod 600 (Unix)');
      }
      
    } catch (error) {
      console.error('[EncryptedAudit] Key save failed:', error.message);
    }
  }
  
  /**
   * Шифрование данных
   */
  _encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    const plaintext = JSON.stringify(data);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag,
      algorithm: this.algorithm,
      timestamp: Date.now()
    };
  }
  
  /**
   * Дешифрование данных
   */
  _decrypt(encryptedObj) {
    try {
      const iv = Buffer.from(encryptedObj.iv, 'hex');
      const authTag = Buffer.from(encryptedObj.authTag, 'hex');
      
      const decipher = crypto.createDecipheriv(
        encryptedObj.algorithm || this.algorithm,
        this.key,
        iv
      );
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[EncryptedAudit] Decrypt failed:', error.message);
      throw new DecryptionError('Decryption failed: ' + error.message);
    }
  }
  
  /**
   * Запись аудиторского лога
   */
  log(entry) {
    this.metrics.totalLogs++;
    
    const enrichedEntry = {
      ...entry,
      timestamp: entry.timestamp || Date.now(),
      pid: process.pid
    };
    
    try {
      const encrypted = this._encrypt(enrichedEntry);
      
      const line = JSON.stringify(encrypted);
      fs.appendFileSync(this.logFile, line + '\n', 'utf8');
      
      this.metrics.encryptedLogs++;
      
    } catch (error) {
      this.metrics.failedEncryptions++;
      console.error('[EncryptedAudit] Log failed:', error.message);
      
      // Fallback: запись в незашифрованный лог (только для критических ошибок)
      if (entry.severity === 'CRITICAL') {
        const fallbackFile = this.logFile.replace('.jsonl', '-fallback.jsonl');
        fs.appendFileSync(fallbackFile, JSON.stringify(enrichedEntry) + '\n', 'utf8');
      }
    }
  }
  
  /**
   * Логирование действия Guard
   */
  logGuardAction(agent, action, path, decision, reason) {
    this.log({
      type: 'guard_action',
      agent,
      action,
      path,
      decision,
      reason,
      severity: decision === 'blocked' ? 'warning' : 'info'
    });
  }
  
  /**
   * Логирование инцидента безопасности
   */
  logSecurityIncident(type, severity, details) {
    this.log({
      type: 'security_incident',
      incidentType: type,
      severity,
      details,
      timestamp: Date.now()
    });
  }
  
  /**
   * Логирование доступа к PII
   */
  logPIIAccess(type, context, masked) {
    this.log({
      type: 'pii_access',
      piiType: type,
      context,
      masked,
      severity: 'info'
    });
  }
  
  /**
   * Чтение и дешифрование логов
   */
  readLogs(options = {}) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }
      
      const content = fs.readFileSync(this.logFile, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      
      const logs = [];
      const startTime = options.startTime || 0;
      const endTime = options.endTime || Date.now();
      const typeFilter = options.type;
      
      for (const line of lines) {
        try {
          const encrypted = JSON.parse(line);
          
          if (encrypted.timestamp < startTime || encrypted.timestamp > endTime) {
            continue;
          }
          
          const decrypted = this._decrypt(encrypted);
          
          if (typeFilter && decrypted.type !== typeFilter) {
            continue;
          }
          
          logs.push(decrypted);
        } catch (error) {
          console.warn('[EncryptedAudit] Read line failed:', error.message);
        }
      }
      
      return logs.sort((a, b) => a.timestamp - b.timestamp);
      
    } catch (error) {
      console.error('[EncryptedAudit] Read logs failed:', error.message);
      return [];
    }
  }
  
  /**
   * Ротация ключа
   */
  rotateKey() {
    console.log('[EncryptedAudit] Starting key rotation');
    
    const oldKey = this.key;
    this._generateKey();
    this.metrics.keyRotations++;
    
    // Перешифрование старых логов новым ключом
    try {
      const logs = this.readLogs();
      
      if (logs.length > 0) {
        // Временное переключение на старый ключ для дешифрования
        this.key = oldKey;
        const decryptedLogs = this.readLogs();
        
        // Возврат к новому ключу
        this.key = crypto.randomBytes(this.keyLength);
        
        // Перезапись логов новым ключом
        fs.writeFileSync(this.logFile + '.tmp', '', 'utf8');
        for (const log of decryptedLogs) {
          this.log(log);
        }
        fs.renameSync(this.logFile + '.tmp', this.logFile);
        
        console.log('[EncryptedAudit] Re-encrypted ' + logs.length + ' logs with new key');
      }
    } catch (error) {
      console.error('[EncryptedAudit] Key rotation failed:', error.message);
      this.key = oldKey;
    }
  }
  
  /**
   * Экспорт логов для аудита
   */
  exportForAudit(options = {}) {
    const logs = this.readLogs(options);
    
    const exportData = {
      exportedAt: Date.now(),
      exportedBy: options.exportedBy || 'system',
      totalLogs: logs.length,
      logs: logs.map(log => ({
        ...log,
        // Маскирование чувствительных данных при экспорте
        details: this._maskSensitiveData(log.details)
      }))
    };
    
    const exportFile = options.exportFile || '.opencode/logs/audit-export-' + Date.now() + '.json';
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log('[EncryptedAudit] Exported ' + logs.length + ' logs to ' + exportFile);
    
    return exportFile;
  }
  
  /**
   * Маскирование чувствительных данных
   */
  _maskSensitiveData(data) {
    if (!data) return data;
    
    const masked = JSON.stringify(data);
    
    // Маскирование PII
    const patterns = [
      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_MASKED]' },
      { regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CARD_MASKED]' },
      { regex: /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/g, replacement: '[PHONE_MASKED]' },
      { regex: /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d?[A-Z]{2}\b/gi, replacement: '[POSTCODE_MASKED]' },
      { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[IP_MASKED]' }
    ];
    
    let result = masked;
    for (const pattern of patterns) {
      result = result.replace(pattern.regex, pattern.replacement);
    }
    
    try {
      return JSON.parse(result);
    } catch (error) {
      return data;
    }
  }
  
  /**
   * Получение метрик
   */
  getMetrics() {
    return {
      ...this.metrics,
      keyGenerated: !!this.key,
      logFileExists: fs.existsSync(this.logFile)
    };
  }
}

class DecryptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DecryptionError';
  }
}

// Plugin interface
module.exports = {
  name: 'encrypted-audit-logs',
  version: '1.0.0',
  init: (api) => {
    const logger = new EncryptedAuditLogger();
    
    api.on('guard:action', (data) => {
      logger.logGuardAction(
        data.agent,
        data.action,
        data.path,
        data.decision,
        data.reason
      );
    });
    
    api.on('security:incident', (data) => {
      logger.logSecurityIncident(
        data.type,
        data.severity,
        data.details
      );
    });
    
    api.on('pii:access', (data) => {
      logger.logPIIAccess(
        data.type,
        data.context,
        data.masked
      );
    });
    
    console.log('[EncryptedAudit] Plugin registered');
    
    return {
      logger,
      exportLogs: (options) => logger.exportForAudit(options),
      getMetrics: () => logger.getMetrics()
    };
  }
};
