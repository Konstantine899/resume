/**
 * Circuit Breaker Plugin for MCP Servers
 * Version: 1.0.0
 * 
 * @plugin circuit-breaker
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.threshold = options.threshold || 3;
    this.resetTimeout = options.resetTimeout || 60000;
    this.halfOpenMax = options.halfOpenMax || 2;
    
    this.initialized = false;
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      blockedCalls: 0,
      stateChanges: 0
    };
    
    this.onStateChange = options.onStateChange || (() => {});
    this.onAlert = options.onAlert || (() => {});
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.threshold) this.threshold = config.threshold;
      if (config.resetTimeout) this.resetTimeout = config.resetTimeout;
      if (config.halfOpenMax) this.halfOpenMax = config.halfOpenMax;
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[CircuitBreaker] Initialized');
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
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        circuitState: this.state
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
  
  async call(fn, context = 'unknown') {
    this.metrics.totalCalls++;
    
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure >= this.resetTimeout) {
        this._setState('HALF_OPEN');
        console.log('[CircuitBreaker] ' + context + ': OPEN -> HALF_OPEN');
      } else {
        this.metrics.blockedCalls++;
        const waitTime = Math.round((this.resetTimeout - timeSinceLastFailure) / 1000);
        throw new CircuitOpenError(
          'Circuit is OPEN for ' + context + '. Retry in ' + waitTime + 's',
          context,
          waitTime
        );
      }
    }
    
    const startTime = Date.now();
    
    try {
      const result = await fn();
      this._onSuccess(context, Date.now() - startTime);
      return result;
    } catch (error) {
      this._onFailure(context, error, Date.now() - startTime);
      throw error;
    }
  }
  
  _onSuccess(context, duration) {
    this.successCount++;
    this.lastFailureTime = Date.now();
    this.metrics.successfulCalls++;
    
    if (this.state === 'HALF_OPEN') {
      if (this.successCount >= this.halfOpenMax) {
        this._setState('CLOSED');
        console.log('[CircuitBreaker] ' + context + ': HALF_OPEN -> CLOSED');
      }
    }
    
    if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }
  
  _onFailure(context, error, duration) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.metrics.failedCalls++;
    
    if (this.state === 'CLOSED' && this.failureCount >= this.threshold) {
      this._setState('OPEN');
      console.log('[CircuitBreaker] ' + context + ': CLOSED -> OPEN (' + this.failureCount + ' failures)');
      this._onAlert('CRITICAL', 'Circuit OPEN for ' + context, {
        failureCount: this.failureCount,
        error: error.message
      });
    } else if (this.state === 'HALF_OPEN') {
      this._setState('OPEN');
      console.log('[CircuitBreaker] ' + context + ': HALF_OPEN -> OPEN (test failed)');
    }
  }
  
  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.metrics.stateChanges++;
    
    this.onStateChange({ oldState, newState, timestamp: Date.now() });
  }
  
  _onAlert(severity, message, data) {
    this.onAlert({ severity, message, data, timestamp: Date.now(), state: this.state });
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      metrics: Object.assign({}, this.metrics),
      config: {
        threshold: this.threshold,
        resetTimeout: this.resetTimeout,
        halfOpenMax: this.halfOpenMax
      }
    };
  }
  
  forceState(state) {
    if (['CLOSED', 'OPEN', 'HALF_OPEN'].includes(state)) {
      this._setState(state);
      this.failureCount = 0;
      this.successCount = 0;
    }
  }
  
  resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      blockedCalls: 0,
      stateChanges: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.forceState('CLOSED');
      this.resetMetrics();
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[CircuitBreaker] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[CircuitBreaker] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

class CircuitOpenError extends Error {
  constructor(message, context, waitTime) {
    super(message);
    this.name = 'CircuitOpenError';
    this.context = context;
    this.waitTime = waitTime;
    this.timestamp = Date.now();
  }
}

class MCPCircuitManager {
  constructor(options = {}) {
    this.breakers = new Map();
    this.defaultConfig = {
      threshold: options.threshold || 3,
      resetTimeout: options.resetTimeout || 60000,
      halfOpenMax: options.halfOpenMax || 2,
      alertOnOpen: options.alertOnOpen !== false
    };
    this.alertCallback = options.onAlert || ((alert) => {
      console.log('[MCP Circuit Alert] ' + alert.severity + ': ' + alert.message);
    });
    this.initialized = false;
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    if (config.threshold) this.defaultConfig.threshold = config.threshold;
    if (config.resetTimeout) this.defaultConfig.resetTimeout = config.resetTimeout;
    if (config.halfOpenMax) this.defaultConfig.halfOpenMax = config.halfOpenMax;
    
    this.initialized = true;
    console.log('[MCP Circuit] Manager initialized');
    return { status: 'initialized', latency: Date.now() - startTime };
  }
  
  async health() {
    const states = this.getAllStates();
    const allHealthy = Object.values(states).every(s => s.state !== 'OPEN');
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      breakers: Object.keys(states).length,
      openCount: Object.values(states).filter(s => s.state === 'OPEN').length
    };
  }
  
  getOrCreate(mcpServer) {
    if (!this.breakers.has(mcpServer)) {
      const breaker = new CircuitBreaker(Object.assign({}, this.defaultConfig, {
        onStateChange: (event) => {
          console.log('[MCP Circuit:' + mcpServer + '] ' + event.oldState + ' -> ' + event.newState);
        },
        onAlert: (alert) => {
          alert.mcpServer = mcpServer;
          this.alertCallback(alert);
        }
      }));
      
      this.breakers.set(mcpServer, breaker);
      console.log('[MCP Circuit:' + mcpServer + '] Created');
    }
    
    return this.breakers.get(mcpServer);
  }
  
  async call(mcpServer, fn, context) {
    const breaker = this.getOrCreate(mcpServer);
    return await breaker.call(fn, context);
  }
  
  getAllStates() {
    const states = {};
    for (const [server, breaker] of this.breakers) {
      states[server] = breaker.getState();
    }
    return states;
  }
  
  forceState(mcpServer, state) {
    const breaker = this.getOrCreate(mcpServer);
    breaker.forceState(state);
  }
  
  resetAll() {
    for (const [server, breaker] of this.breakers) {
      breaker.resetMetrics();
      breaker.forceState('CLOSED');
    }
    console.log('[MCP Circuit] All breakers reset');
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      this.resetAll();
      this.breakers.clear();
      this.initialized = false;
      
      console.log('[MCP Circuit] Manager shutdown complete');
      return { status: 'shutdown_complete' };
      
    } catch (error) {
      console.error('[MCP Circuit] Manager shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  CircuitBreaker,
  CircuitOpenError,
  MCPCircuitManager
};
