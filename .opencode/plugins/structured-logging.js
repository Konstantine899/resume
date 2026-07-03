/**
 * Structured Logging Plugin
 * Version: 1.0.0
 * 
 * JSON форматирование логов с trace ID для наблюдаемости
 * 
 * @plugin structured-logging
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies none
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StructuredLogger {
  constructor(options = {}) {
    this.logFile = options.logFile || '.opencode/logs/opencode.jsonl';
    this.logLevel = options.logLevel || 'INFO';
    this.prettyPrint = options.prettyPrint || false;
    this.sampling = options.sampling || { enabled: false, rate: 0.1 };
    
    this.initialized = false;
    this.currentTraceId = null;
    this.currentSpanId = null;
    this.currentAgent = null;
    this.currentMcpServer = null;
    
    this.metrics = {
      totalLogs: 0,
      byLevel: {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        CRITICAL: 0
      },
      sampled: 0
    };
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.logFile) this.logFile = config.logFile;
      if (config.logLevel) this.logLevel = config.logLevel;
      if (config.sampling) this.sampling = config.sampling;
      
      this._ensureDirectory();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[StructuredLogger] Initialized (file: ' + this.logFile + ')');
      return { status: 'initialized', latency: Date.now() - startTime };
      
    } catch (error) {
      this.healthStatus = {
        status: 'unhealthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        error: error.message
      };
      throw error;
    }
  }
  
  async health() {
    const startTime = Date.now();
    
    try {
      const dir = path.dirname(this.logFile);
      const isAccessible = fs.existsSync(dir);
      
      this.healthStatus = {
        status: isAccessible ? 'healthy' : 'unhealthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      return this.healthStatus;
      
    } catch (error) {
      this.healthStatus = {
        status: 'unhealthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        error: error.message
      };
      return this.healthStatus;
    }
  }
  
  /**
   * Создание директории
   */
  _ensureDirectory() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Генерация trace ID
   */
  _generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }
  
  /**
   * Генерация span ID
   */
  _generateSpanId() {
    return crypto.randomBytes(8).toString('hex').substring(0, 8);
  }
  
  /**
   * Начало нового trace
   */
  startTrace(agent = 'unknown') {
    this.currentTraceId = this._generateTraceId();
    this.currentSpanId = this._generateSpanId();
    this.currentAgent = agent;
    
    this.log('TRACE_START', 'New trace started', {
      traceId: this.currentTraceId,
      spanId: this.currentSpanId,
      agent: this.currentAgent
    });
    
    return this.currentTraceId;
  }
  
  /**
   * Создание нового span в текущем trace
   */
  startSpan(operation, mcpServer = null) {
    const parentSpanId = this.currentSpanId;
    this.currentSpanId = this._generateSpanId();
    this.currentMcpServer = mcpServer;
    
    this.log('SPAN_START', operation, {
      traceId: this.currentTraceId,
      spanId: this.currentSpanId,
      parentSpanId,
      mcpServer
    });
    
    return this.currentSpanId;
  }
  
  /**
   * Завершение span
   */
  endSpan(operation, duration, status = 'success', metadata = {}) {
    this.log('SPAN_END', operation, {
      traceId: this.currentTraceId,
      spanId: this.currentSpanId,
      duration,
      status,
      mcpServer: this.currentMcpServer,
      ...metadata
    });
    
    this.currentMcpServer = null;
  }
  
  /**
   * Завершение trace
   */
  endTrace(status = 'success') {
    this.log('TRACE_END', 'Trace completed', {
      traceId: this.currentTraceId,
      status
    });
    
    this.currentTraceId = null;
    this.currentSpanId = null;
    this.currentAgent = null;
  }
  
  /**
   * Основной метод логирования
   */
  log(level, message, metadata = {}) {
    this.metrics.totalLogs++;
    
    // Проверка уровня логирования
    if (!this._shouldLog(level)) {
      return;
    }
    
    // Sampling для DEBUG уровня
    if (level === 'DEBUG' && this.sampling.enabled) {
      if (Math.random() > this.sampling.rate) {
        this.metrics.sampled++;
        return;
      }
    }
    
    this.metrics.byLevel[level]++;
    
    const entry = {
      timestamp: new Date().toISOString(),
      trace_id: this.currentTraceId || this._generateTraceId(),
      span_id: this.currentSpanId,
      level,
      agent: this.currentAgent,
      mcp_server: this.currentMcpServer,
      message,
      metadata,
      pid: process.pid
    };
    
    // Всегда sample ERROR и CRITICAL
    if (level === 'ERROR' || level === 'CRITICAL') {
      this._writeLog(entry);
    } else {
      this._writeLog(entry);
    }
  }
  
  /**
   * Проверка уровня логирования
   */
  _shouldLog(level) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }
  
  /**
   * Запись лога
   */
  _writeLog(entry) {
    try {
      const line = this.prettyPrint
        ? JSON.stringify(entry, null, 2)
        : JSON.stringify(entry);
      
      fs.appendFileSync(this.logFile, line + '\n', 'utf8');
      
    } catch (error) {
      console.error('[StructuredLogger] Write failed:', error.message);
    }
  }
  
  /**
   * Convenience методы
   */
  debug(message, metadata) {
    this.log('DEBUG', message, metadata);
  }
  
  info(message, metadata) {
    this.log('INFO', message, metadata);
  }
  
  warn(message, metadata) {
    this.log('WARN', message, metadata);
  }
  
  error(message, metadata) {
    this.log('ERROR', message, metadata);
  }
  
  critical(message, metadata) {
    this.log('CRITICAL', message, metadata);
  }
  
  /**
   * Логирование MCP вызова
   */
  logMcpCall(mcpServer, operation, status, duration, error = null) {
    this.log('MCP_CALL', operation, {
      mcpServer,
      status,
      duration,
      error: error ? error.message : null,
      traceId: this.currentTraceId
    });
  }
  
  /**
   * Логирование ошибки
   */
  logError(error, context = {}) {
    this.log('ERROR', error.message, {
      stack: error.stack,
      ...context
    });
  }
  
  /**
   * Логирование инцидента безопасности
   */
  logSecurityIncident(type, severity, details) {
    this.log('CRITICAL', 'Security incident: ' + type, {
      severity,
      type,
      ...details
    });
  }
  
  /**
   * Получение метрик
   */
  getMetrics() {
    const hitRate = this.metrics.totalLogs > 0
      ? ((this.metrics.totalLogs - this.metrics.sampled) / this.metrics.totalLogs * 100).toFixed(2)
      : 0;
    
    return {
      totalLogs: this.metrics.totalLogs,
      byLevel: Object.assign({}, this.metrics.byLevel),
      sampled: this.metrics.sampled,
      logRate: hitRate + '%'
    };
  }
  
  /**
   * Сброс метрик
   */
  resetMetrics() {
    this.metrics = {
      totalLogs: 0,
      byLevel: {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        CRITICAL: 0
      },
      sampled: 0
    };
  }
  
  /**
   * Установка уровня логирования
   */
  setLevel(level) {
    this.logLevel = level;
    console.log('[StructuredLogger] Level set to ' + level);
  }
  
  /**
   * Lifecycle: Shutdown - очистка ресурсов
   */
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.info('Plugin shutdown', { component: 'structured-logging' });
      
      this.currentTraceId = null;
      this.currentSpanId = null;
      this.currentAgent = null;
      this.currentMcpServer = null;
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[StructuredLogger] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[StructuredLogger] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

// Глобальный экземпляр
let globalLogger = null;

function getLogger(options) {
  if (!globalLogger) {
    globalLogger = new StructuredLogger(options);
  }
  return globalLogger;
}

// Экспорт
module.exports = {
  StructuredLogger,
  getLogger
};
