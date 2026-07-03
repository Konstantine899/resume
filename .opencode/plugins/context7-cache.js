/**
 * Context7 LRU Cache Plugin
 * Version: 1.0.0
 * 
 * @plugin context7-cache
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class Context7Cache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 3600000;
    this.memoryPath = options.memoryPath || '.opencode/context/context7-cache.json';
    this.persistToFile = options.persistToFile !== false;
    
    this.initialized = false;
    this.cache = new Map();
    this._cleanupTimer = null;
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      expirations: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.maxSize) this.maxSize = config.maxSize;
      if (config.ttl) this.ttl = config.ttl;
      if (config.memoryPath) this.memoryPath = config.memoryPath;
      if (config.persistToFile !== undefined) this.persistToFile = config.persistToFile;
      
      this._loadCache();
      this._startExpirationChecker();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        cacheSize: this.cache.size
      };
      
      console.log('[Context7Cache] Initialized (maxSize: ' + this.maxSize + ', ttl: ' + this.ttl + 'ms)');
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
      const dirExists = fs.existsSync(path.dirname(this.memoryPath));
      
      this.healthStatus = {
        status: dirExists ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        cacheSize: this.cache.size,
        maxSize: this.maxSize,
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
  
  _generateKey(query) {
    return crypto.createHash('sha256').update(query).digest('hex');
  }
  
  get(query) {
    this.metrics.totalRequests++;
    
    const key = this._generateKey(query);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.cacheMisses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.metrics.expirations++;
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    this.metrics.cacheHits++;
    return entry.data;
  }
  
  set(query, data) {
    const key = this._generateKey(query);
    
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
    
    this.cache.set(key, {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.ttl
    });
    
    if (this.persistToFile) {
      this._saveCache();
    }
  }
  
  has(query) {
    const key = this._generateKey(query);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  clear() {
    this.cache.clear();
    if (this.persistToFile) {
      this._saveCache();
    }
    console.log('[Context7Cache] Cache cleared');
  }
  
  _cleanupExpired() {
    const now = Date.now();
    let expired = 0;
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        expired++;
      }
    }
    
    if (expired > 0) {
      console.log('[Context7Cache] Cleaned up ' + expired + ' expired entries');
      if (this.persistToFile) {
        this._saveCache();
      }
    }
  }
  
  _startExpirationChecker() {
    this._cleanupTimer = setInterval(() => {
      this._cleanupExpired();
    }, 60000);
  }
  
  _saveCache() {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const cacheObj = {};
      for (const [key, value] of this.cache) {
        cacheObj[key] = value;
      }
      
      const tempPath = this.memoryPath + '.tmp.' + Date.now();
      fs.writeFileSync(tempPath, JSON.stringify(cacheObj, null, 2), 'utf8');
      fs.renameSync(tempPath, this.memoryPath);
      
    } catch (error) {
      console.warn('[Context7Cache] Save failed:', error.message);
    }
  }
  
  _loadCache() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const content = fs.readFileSync(this.memoryPath, 'utf8');
        const cacheObj = JSON.parse(content);
        
        const now = Date.now();
        let loaded = 0;
        let expired = 0;
        
        for (const [key, value] of Object.entries(cacheObj)) {
          if (now <= value.expiresAt) {
            this.cache.set(key, value);
            loaded++;
          } else {
            expired++;
          }
        }
        
        console.log('[Context7Cache] Loaded ' + loaded + ' entries (' + expired + ' expired)');
      }
      
    } catch (error) {
      console.warn('[Context7Cache] Load failed:', error.message);
    }
  }
  
  getStats() {
    const hitRate = this.metrics.totalRequests > 0
      ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      metrics: Object.assign({}, this.metrics),
      hitRate: hitRate + '%'
    };
  }
  
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictions: 0,
      expirations: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this._cleanupTimer) {
        clearInterval(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      
      if (this.persistToFile) {
        this._saveCache();
      }
      
      this.cache.clear();
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[Context7Cache] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[Context7Cache] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  Context7Cache
};
