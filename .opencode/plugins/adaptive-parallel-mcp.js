/**
 * Adaptive Parallel MCP Plugin
 * Version: 1.0.0
 * 
 * @plugin adaptive-parallel-mcp
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging, agent-metrics
 */

class AdaptiveParallelMCP {
  constructor(options = {}) {
    this.minConcurrency = options.minConcurrency || 2;
    this.maxConcurrency = options.maxConcurrency || 5;
    this.currentConcurrency = options.initialConcurrency || 3;
    this.basedOn = options.basedOn || 'resourceUsage';
    
    this.initialized = false;
    this._monitoringTimer = null;
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalCalls: 0,
      parallelCalls: 0,
      sequentialCalls: 0,
      throttledCalls: 0,
      avgConcurrency: 0
    };
    
    this.activeConnections = 0;
    this.pendingQueue = [];
    this.recentLatencies = [];
    this.errorRates = {};
    
    this.monitoringInterval = options.monitoringInterval || 5000;
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.minConcurrency) this.minConcurrency = config.minConcurrency;
      if (config.maxConcurrency) this.maxConcurrency = config.maxConcurrency;
      if (config.initialConcurrency) this.currentConcurrency = config.initialConcurrency;
      if (config.monitoringInterval) this.monitoringInterval = config.monitoringInterval;
      
      this._startMonitoring();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentConcurrency: this.currentConcurrency
      };
      
      console.log('[AdaptiveParallelMCP] Initialized (min: ' + this.minConcurrency + ', max: ' + this.maxConcurrency + ')');
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
      const utilization = this.activeConnections / this.currentConcurrency;
      const isHealthy = utilization < 0.9;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentConcurrency: this.currentConcurrency,
        activeConnections: this.activeConnections,
        utilization: (utilization * 100).toFixed(2) + '%'
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
  
  async call(mcpServer, fn, context = {}) {
    this.metrics.totalCalls++;
    
    if (this.activeConnections >= this.currentConcurrency) {
      this.metrics.throttledCalls++;
      await this._waitForSlot();
    }
    
    this.activeConnections++;
    this.metrics.parallelCalls++;
    
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      this._recordLatency(mcpServer, duration);
      this.activeConnections--;
      
      return result;
      
    } catch (error) {
      this._recordError(mcpServer, error);
      this.activeConnections--;
      throw error;
    }
  }
  
  async callBatch(calls) {
    const batchSize = Math.min(calls.length, this.currentConcurrency);
    const batch = calls.slice(0, batchSize);
    const remaining = calls.slice(batchSize);
    
    console.log('[AdaptiveParallelMCP] Executing batch of ' + batch.length + ' calls (concurrency: ' + this.currentConcurrency + ')');
    
    const results = await Promise.all(
      batch.map(call => this.call(call.server, call.fn, call.context))
    );
    
    if (remaining.length > 0) {
      const remainingResults = await this.callBatch(remaining);
      return [...results, ...remainingResults];
    }
    
    return results;
  }
  
  _waitForSlot() {
    return new Promise(resolve => {
      const check = () => {
        if (this.activeConnections < this.currentConcurrency) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }
  
  _recordLatency(mcpServer, duration) {
    this.recentLatencies.push({
      server: mcpServer,
      duration,
      timestamp: Date.now()
    });
    
    if (this.recentLatencies.length > 100) {
      this.recentLatencies.shift();
    }
    
    this._adjustConcurrency();
  }
  
  _recordError(mcpServer, error) {
    if (!this.errorRates[mcpServer]) {
      this.errorRates[mcpServer] = { total: 0, errors: 0 };
    }
    
    this.errorRates[mcpServer].total++;
    this.errorRates[mcpServer].errors++;
    
    if (this.errorRates[mcpServer].errors / this.errorRates[mcpServer].total > 0.1) {
      this._reduceConcurrency();
    }
  }
  
  _adjustConcurrency() {
    if (this.recentLatencies.length < 10) return;
    
    const recent = this.recentLatencies.slice(-10);
    const avgLatency = recent.reduce((sum, r) => sum + r.duration, 0) / recent.length;
    
    const oldConcurrency = this.currentConcurrency;
    
    if (avgLatency < 1000 && this.currentConcurrency < this.maxConcurrency) {
      this.currentConcurrency = Math.min(this.maxConcurrency, this.currentConcurrency + 1);
      console.log('[AdaptiveParallelMCP] Increased concurrency: ' + oldConcurrency + ' → ' + this.currentConcurrency);
      
    } else if (avgLatency > 5000 && this.currentConcurrency > this.minConcurrency) {
      this.currentConcurrency = Math.max(this.minConcurrency, this.currentConcurrency - 1);
      console.log('[AdaptiveParallelMCP] Decreased concurrency: ' + oldConcurrency + ' → ' + this.currentConcurrency);
    }
    
    this.metrics.avgConcurrency = this.currentConcurrency;
  }
  
  _reduceConcurrency() {
    const oldConcurrency = this.currentConcurrency;
    
    if (this.currentConcurrency > this.minConcurrency) {
      this.currentConcurrency = Math.max(this.minConcurrency, this.currentConcurrency - 1);
      console.log('[AdaptiveParallelMCP] Reduced concurrency due to errors: ' + oldConcurrency + ' → ' + this.currentConcurrency);
    }
  }
  
  _startMonitoring() {
    this._monitoringTimer = setInterval(() => {
      const stats = this.getStats();
      
      if (stats.avgLatency > 10000) {
        console.warn('[AdaptiveParallelMCP] High avg latency detected: ' + Math.round(stats.avgLatency) + 'ms');
      }
      
      const cutoff = Date.now() - 60000;
      this.recentLatencies = this.recentLatencies.filter(r => r.timestamp > cutoff);
      
    }, this.monitoringInterval);
  }
  
  getStats() {
    const recent = this.recentLatencies.slice(-20);
    const avgLatency = recent.length > 0
      ? recent.reduce((sum, r) => sum + r.duration, 0) / recent.length
      : 0;
    
    const errorRates = {};
    for (const [server, data] of Object.entries(this.errorRates)) {
      errorRates[server] = data.total > 0
        ? (data.errors / data.total * 100).toFixed(2) + '%'
        : '0%';
    }
    
    return {
      currentConcurrency: this.currentConcurrency,
      activeConnections: this.activeConnections,
      pendingQueue: this.pendingQueue.length,
      metrics: Object.assign({}, this.metrics),
      avgLatency: Math.round(avgLatency),
      errorRates,
      utilization: (this.activeConnections / this.currentConcurrency * 100).toFixed(2) + '%'
    };
  }
  
  resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      parallelCalls: 0,
      sequentialCalls: 0,
      throttledCalls: 0,
      avgConcurrency: 0
    };
    this.recentLatencies = [];
    this.errorRates = {};
  }
  
  setConcurrency(value) {
    const clamped = Math.max(this.minConcurrency, Math.min(this.maxConcurrency, value));
    const old = this.currentConcurrency;
    this.currentConcurrency = clamped;
    console.log('[AdaptiveParallelMCP] Manual concurrency change: ' + old + ' → ' + clamped);
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this._monitoringTimer) {
        clearInterval(this._monitoringTimer);
        this._monitoringTimer = null;
      }
      
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[AdaptiveParallelMCP] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[AdaptiveParallelMCP] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  AdaptiveParallelMCP
};
