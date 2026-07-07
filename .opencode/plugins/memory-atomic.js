/**
 * Memory Atomic Write Plugin
 * Version: 1.0.0
 * 
 * @plugin memory-atomic
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging
 */

const fs = require('fs');
const path = require('path');

class MemoryAtomicWriter {
  constructor(options = {}) {
    this.basePath = options.basePath || '.opencode/context';
    this.lockFile = path.join(this.basePath, '.memory.lock');
    this.lockTimeout = options.lockTimeout || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 100;
    
    this.initialized = false;
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalWrites: 0,
      successfulWrites: 0,
      failedWrites: 0,
      lockContentions: 0,
      lockTimeouts: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.basePath) this.basePath = config.basePath;
      if (config.lockTimeout) this.lockTimeout = config.lockTimeout;
      if (config.maxRetries) this.maxRetries = config.maxRetries;
      if (config.retryDelay) this.retryDelay = config.retryDelay;
      
      this._ensureDirectory();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[MemoryAtomic] Initialized');
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
      const dirExists = fs.existsSync(this.basePath);
      const isLocked = fs.existsSync(this.lockFile);
      
      this.healthStatus = {
        status: dirExists && !isLocked ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        isLocked,
        dirExists
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
  
  _ensureDirectory() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }
  
  _tryAcquireLock() {
    try {
      fs.writeFileSync(this.lockFile, process.pid.toString(), { flag: 'wx' });
      return true;
    } catch (error) {
      if (error.code === 'EEXIST') {
        return false;
      }
      throw error;
    }
  }
  
  _releaseLock() {
    try {
      if (fs.existsSync(this.lockFile)) {
        fs.unlinkSync(this.lockFile);
      }
    } catch (error) {
      console.warn('[MemoryAtomic] Failed to release lock:', error.message);
    }
  }
  
  async _waitForLock() {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.lockTimeout) {
      if (this._tryAcquireLock()) {
        return true;
      }
      
      this.metrics.lockContentions++;
      const delay = Math.min(this.retryDelay * (1 + Math.random()), 500);
      
      // Async delay вместо blocking
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.metrics.lockTimeouts++;
    return false;
  }
  
  async atomicWrite(filePath, data) {
    this.metrics.totalWrites++;
    
    let lockAcquired = false;
    
    if (!this._tryAcquireLock()) {
      console.log('[MemoryAtomic] Waiting for lock on ' + filePath);
      lockAcquired = this._waitForLock();
    } else {
      lockAcquired = true;
    }
    
    if (!lockAcquired) {
      this.metrics.failedWrites++;
      throw new LockTimeoutError('Could not acquire lock for ' + filePath);
    }
    
    try {
      let currentData = {};
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        currentData = JSON.parse(content);
      }
      
      const mergedData = this._deepMerge(currentData, data);
      
      const tempPath = filePath + '.tmp.' + Date.now() + '.' + process.pid;
      fs.writeFileSync(tempPath, JSON.stringify(mergedData, null, 2), 'utf8');
      fs.renameSync(tempPath, filePath);
      
      this.metrics.successfulWrites++;
      console.log('[MemoryAtomic] Atomic write to ' + filePath);
      
      return true;
      
    } catch (error) {
      this.metrics.failedWrites++;
      console.error('[MemoryAtomic] Write failed:', error.message);
      throw error;
      
    } finally {
      this._releaseLock();
    }
  }
  
  _deepMerge(target, source) {
    const result = Object.assign({}, target);
    
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (this._isObject(sourceValue) && this._isObject(targetValue)) {
        result[key] = this._deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    
    return result;
  }
  
  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
  
  read(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
      return {};
    } catch (error) {
      console.warn('[MemoryAtomic] Read failed:', error.message);
      return {};
    }
  }
  
  getMetrics() {
    return Object.assign({}, this.metrics);
  }
  
  resetMetrics() {
    this.metrics = {
      totalWrites: 0,
      successfulWrites: 0,
      failedWrites: 0,
      lockContentions: 0,
      lockTimeouts: 0
    };
  }
  
  forceReleaseLock() {
    if (fs.existsSync(this.lockFile)) {
      try {
        fs.unlinkSync(this.lockFile);
        console.log('[MemoryAtomic] Lock forcibly released');
      } catch (error) {
        console.warn('[MemoryAtomic] Force release failed:', error.message);
      }
    }
  }
  
  isLocked() {
    return fs.existsSync(this.lockFile);
  }
  
  getLockInfo() {
    if (!fs.existsSync(this.lockFile)) {
      return { locked: false };
    }
    
    try {
      const content = fs.readFileSync(this.lockFile, 'utf8');
      const pid = parseInt(content, 10);
      
      return {
        locked: true,
        pid: pid,
        age: Date.now() - fs.statSync(this.lockFile).mtimeMs
      };
    } catch (error) {
      return { locked: false, error: error.message };
    }
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.forceReleaseLock();
      this.resetMetrics();
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[MemoryAtomic] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[MemoryAtomic] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

class LockTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LockTimeoutError';
    this.timestamp = Date.now();
  }
}

class MemoryAtomicManager {
  constructor(options = {}) {
    this.writer = new MemoryAtomicWriter(options);
    this.basePath = options.basePath || '.opencode/context';
    this.initialized = false;
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const result = await this.writer.init(config);
    this.initialized = true;
    return result;
  }
  
  async health() {
    return await this.writer.health();
  }
  
  async writeProjectMemory(data) {
    const filePath = path.join(this.basePath, 'project-memory.json');
    return await this.writer.atomicWrite(filePath, data);
  }
  
  async writeContextStore(data) {
    const filePath = path.join(this.basePath, 'context-store.json');
    return await this.writer.atomicWrite(filePath, data);
  }
  
  async writeTaskContext(data) {
    const filePath = path.join(this.basePath, 'task-context.json');
    return await this.writer.atomicWrite(filePath, data);
  }
  
  readProjectMemory() {
    const filePath = path.join(this.basePath, 'project-memory.json');
    return this.writer.read(filePath);
  }
  
  readContextStore() {
    const filePath = path.join(this.basePath, 'context-store.json');
    return this.writer.read(filePath);
  }
  
  readTaskContext() {
    const filePath = path.join(this.basePath, 'task-context.json');
    return this.writer.read(filePath);
  }
  
  getMetrics() {
    return this.writer.getMetrics();
  }
  
  isLocked() {
    return this.writer.isLocked();
  }
  
  getLockInfo() {
    return this.writer.getLockInfo();
  }
  
  forceReleaseLock() {
    return this.writer.forceReleaseLock();
  }
  
  async shutdown() {
    this.initialized = false;
    return await this.writer.shutdown();
  }
}

module.exports = {
  MemoryAtomicWriter,
  MemoryAtomicManager,
  LockTimeoutError
};
