/**
 * Request Deduplication Plugin
 * Version: 1.0.0
 * 
 * @plugin request-deduplication
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging
 */

const crypto = require('crypto');

class RequestDeduplicator {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 1000;
    this.maxPending = options.maxPending || 100;
    
    this.initialized = false;
    this.pendingRequests = new Map();
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalRequests: 0,
      uniqueRequests: 0,
      deduplicatedRequests: 0,
      completedRequests: 0,
      failedRequests: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.windowMs) this.windowMs = config.windowMs;
      if (config.maxPending) this.maxPending = config.maxPending;
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[RequestDeduplication] Initialized (window: ' + this.windowMs + 'ms)');
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
      const pendingSize = this.pendingRequests.size;
      const isHealthy = pendingSize < this.maxPending * 0.8;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        pendingRequests: pendingSize,
        maxPending: this.maxPending
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
  
  _generateHash(server, operation, args) {
    const key = JSON.stringify({
      server,
      operation,
      args: args || {}
    });
    
    return crypto.createHash('sha256').update(key).digest('hex');
  }
  
  async call(server, fn, operation, args = {}) {
    this.metrics.totalRequests++;
    
    const hash = this._generateHash(server, operation, args);
    
    if (this.pendingRequests.has(hash)) {
      this.metrics.deduplicatedRequests++;
      console.log('[RequestDedup] Deduplicating: ' + operation);
      
      const pending = this.pendingRequests.get(hash);
      return await pending.promise;
    }
    
    this.metrics.uniqueRequests++;
    
    const pending = {
      hash,
      server,
      operation,
      createdAt: Date.now(),
      resolve: null,
      reject: null,
      promise: null
    };
    
    pending.promise = new Promise((resolve, reject) => {
      pending.resolve = resolve;
      pending.reject = reject;
    });
    
    this.pendingRequests.set(hash, pending);
    
    // Cleanup вынесен в timer (не в горячем пути)
    if (!this._cleanupTimer) {
      this._cleanupTimer = setInterval(() => this._cleanupOldPending(), this.windowMs);
    }
    
    try {
      const result = await fn();
      
      pending.resolve(result);
      this.metrics.completedRequests++;
      
      return result;
      
    } catch (error) {
      pending.reject(error);
      this.metrics.failedRequests++;
      throw error;
      
    } finally {
      this.pendingRequests.delete(hash);
    }
  }
  
  async callBatch(calls) {
    const uniqueCalls = [];
    const seenHashes = new Set();
    
    for (const call of calls) {
      const hash = this._generateHash(call.server, call.operation, call.args);
      
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        uniqueCalls.push(call);
      } else {
        this.metrics.deduplicatedRequests++;
      }
    }
    
    this.metrics.totalRequests += calls.length;
    this.metrics.uniqueRequests += uniqueCalls.length;
    
    const results = await Promise.all(
      uniqueCalls.map(call =>
        this.call(call.server, call.fn, call.operation, call.args)
      )
    );
    
    return results;
  }
  
  _cleanupOldPending() {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    let cleaned = 0;
    
    for (const [hash, pending] of this.pendingRequests) {
      if (pending.createdAt < cutoff) {
        this.pendingRequests.delete(hash);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log('[RequestDedup] Cleaned up ' + cleaned + ' stale pending requests');
    }
    
    if (this.pendingRequests.size > this.maxPending) {
      const entries = Array.from(this.pendingRequests.entries());
      const sorted = entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
      const toRemoveCount = sorted.length - this.maxPending;
      
      for (let i = 0; i < toRemoveCount; i++) {
        this.pendingRequests.delete(sorted[i][0]);
      }
      
      console.log('[RequestDedup] Trimmed pending queue to ' + this.maxPending);
    }
  }
  
  getStats() {
    const dedupRate = this.metrics.totalRequests > 0
      ? (this.metrics.deduplicatedRequests / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
    
    return {
      pendingRequests: this.pendingRequests.size,
      maxPending: this.maxPending,
      windowMs: this.windowMs,
      metrics: Object.assign({}, this.metrics),
      dedupRate: dedupRate + '%',
      efficiency: this.metrics.totalRequests > 0
        ? ((this.metrics.totalRequests - this.metrics.deduplicatedRequests) / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '100%'
    };
  }
  
  clearPending() {
    const count = this.pendingRequests.size;
    this.pendingRequests.clear();
    console.log('[RequestDedup] Cleared ' + count + ' pending requests');
    return count;
  }
  
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      uniqueRequests: 0,
      deduplicatedRequests: 0,
      completedRequests: 0,
      failedRequests: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      // Остановка timer
      if (this._cleanupTimer) {
        clearInterval(this._cleanupTimer);
        this._cleanupTimer = null;
      }
      
      // Reject всех pending requests
      for (const [hash, pending] of this.pendingRequests) {
        pending.reject(new Error('Shutdown'));
      }
      this.pendingRequests.clear();
      
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[RequestDeduplication] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[RequestDeduplication] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  RequestDeduplicator
};
