/**
 * Graceful Degradation Plugin
 * Version: 1.0.0
 * 
 * @plugin graceful-degradation
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging, circuit-breaker, agent-metrics
 */

class GracefulDegradationManager {
  constructor(options = {}) {
    this.degradationLevels = {
      FULL: 'full',
      REDUCED: 'reduced',
      MINIMAL: 'minimal',
      OFFLINE: 'offline'
    };
    
    this.initialized = false;
    this.currentLevel = this.degradationLevels.FULL;
    this.disabledFeatures = new Set();
    this.fallbackModes = new Map();
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      degradationEvents: 0,
      recoveryEvents: 0,
      timeInDegraded: 0,
      lastDegradationTime: 0,
      lastRecoveryTime: Date.now()
    };
    
    this.healthChecks = new Map();
    this.recoveryInterval = options.recoveryInterval || 30000;
    this._monitorInterval = null;
    this._monitoringActive = false;
    
    this.onDegradationChange = options.onDegradationChange || (() => {});
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.recoveryInterval) this.recoveryInterval = config.recoveryInterval;
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentLevel: this.currentLevel
      };
      
      console.log('[GracefulDegradation] Initialized');
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
      const isHealthy = this.currentLevel === this.degradationLevels.FULL;
      const unhealthyCount = this.disabledFeatures.size;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentLevel: this.currentLevel,
        disabledFeaturesCount: unhealthyCount,
        componentCount: this.healthChecks.size
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
  
  registerComponent(name, healthCheckFn, fallbackFn) {
    this.healthChecks.set(name, {
      name,
      healthCheck: healthCheckFn,
      fallback: fallbackFn,
      healthy: true,
      consecutiveFailures: 0,
      lastCheck: Date.now()
    });
    
    console.log('[GracefulDegradation] Registered component: ' + name);
  }
  
  async checkComponentHealth(name) {
    const component = this.healthChecks.get(name);
    
    if (!component) {
      console.warn('[GracefulDegradation] Unknown component: ' + name);
      return true;
    }
    
    try {
      const healthy = await component.healthCheck();
      
      if (healthy) {
        component.consecutiveFailures = 0;
        component.healthy = true;
        component.lastCheck = Date.now();
        return true;
      } else {
        throw new Error('Health check returned false');
      }
      
    } catch (error) {
      component.consecutiveFailures++;
      component.lastCheck = Date.now();
      
      console.warn('[GracefulDegradation] Component ' + name + ' unhealthy (' + component.consecutiveFailures + ')');
      
      if (component.consecutiveFailures >= 3) {
        this._activateFallback(name, component);
        return false;
      }
      
      return false;
    }
  }
  
  _activateFallback(name, component) {
    if (component.healthy) {
      component.healthy = false;
      this.disabledFeatures.add(name);
      
      console.log('[GracefulDegradation] Activating fallback for: ' + name);
      
      if (component.fallback) {
        component.fallback();
      }
      
      this._updateDegradationLevel();
    }
  }
  
  _updateDegradationLevel() {
    const totalComponents = this.healthChecks.size;
    const unhealthyCount = this.disabledFeatures.size;
    const healthRatio = totalComponents > 0 ? unhealthyCount / totalComponents : 0;
    
    const oldLevel = this.currentLevel;
    
    if (healthRatio === 0) {
      this.currentLevel = this.degradationLevels.FULL;
    } else if (healthRatio < 0.3) {
      this.currentLevel = this.degradationLevels.REDUCED;
    } else if (healthRatio < 0.7) {
      this.currentLevel = this.degradationLevels.MINIMAL;
    } else {
      this.currentLevel = this.degradationLevels.OFFLINE;
    }
    
    if (oldLevel !== this.currentLevel) {
      this.metrics.degradationEvents++;
      this.metrics.lastDegradationTime = Date.now();
      
      console.log('[GracefulDegradation] Level changed: ' + oldLevel + ' → ' + this.currentLevel);
      
      this.onDegradationChange({
        oldLevel,
        newLevel: this.currentLevel,
        disabledFeatures: Array.from(this.disabledFeatures),
        timestamp: Date.now()
      });
    }
  }
  
  async executeWithDegradation(operation, primaryFn, fallbackFn, context = {}) {
    if (this.currentLevel === this.degradationLevels.OFFLINE) {
      console.warn('[GracefulDegradation] OFFLINE mode, using fallback for: ' + operation);
      return await fallbackFn();
    }
    
    try {
      return await primaryFn();
      
    } catch (error) {
      console.warn('[GracefulDegradation] Primary failed for ' + operation + ', using fallback');
      return await fallbackFn();
    }
  }
  
  startHealthMonitoring() {
    if (this._monitoringActive) return;
    
    this._monitoringActive = true;
    
    const checkAll = async () => {
      for (const [name] of this.healthChecks) {
        await this.checkComponentHealth(name);
      }
      
      await this._attemptRecovery();
    };
    
    this._monitorInterval = setInterval(checkAll, this.recoveryInterval);
    
    console.log('[GracefulDegradation] Health monitoring started (interval: ' + this.recoveryInterval + 'ms)');
  }
  
  async _attemptRecovery() {
    for (const [name, component] of this.healthChecks) {
      if (!component.healthy) {
        try {
          const healthy = await component.healthCheck();
          
          if (healthy) {
            component.healthy = true;
            this.disabledFeatures.delete(name);
            
            console.log('[GracefulDegradation] Component recovered: ' + name);
            
            this.metrics.recoveryEvents++;
            this.metrics.lastRecoveryTime = Date.now();
            
            this._updateDegradationLevel();
          }
          
        } catch (error) {
          // Component still unhealthy
        }
      }
    }
  }
  
  getStatus() {
    const components = {};
    
    for (const [name, component] of this.healthChecks) {
      components[name] = {
        healthy: component.healthy,
        consecutiveFailures: component.consecutiveFailures,
        lastCheck: component.lastCheck
      };
    }
    
    return {
      currentLevel: this.currentLevel,
      disabledFeatures: Array.from(this.disabledFeatures),
      components,
      metrics: Object.assign({}, this.metrics),
      uptime: Date.now() - this.metrics.lastRecoveryTime
    };
  }
  
  getDegradationLevel() {
    return this.currentLevel;
  }
  
  isFeatureEnabled(featureName) {
    return !this.disabledFeatures.has(featureName);
  }
  
  forceFallback(featureName) {
    this.disabledFeatures.add(featureName);
    this._updateDegradationLevel();
    console.log('[GracefulDegradation] Forcibly disabled: ' + featureName);
  }
  
  forceRecovery(featureName) {
    this.disabledFeatures.delete(featureName);
    
    const component = this.healthChecks.get(featureName);
    if (component) {
      component.healthy = true;
      component.consecutiveFailures = 0;
    }
    
    this._updateDegradationLevel();
    console.log('[GracefulDegradation] Forcibly recovered: ' + featureName);
  }
  
  resetMetrics() {
    this.metrics = {
      degradationEvents: 0,
      recoveryEvents: 0,
      timeInDegraded: 0,
      lastDegradationTime: 0,
      lastRecoveryTime: Date.now()
    };
  }
  
  stopMonitoring() {
    if (this._monitorInterval) {
      clearInterval(this._monitorInterval);
      this._monitorInterval = null;
      this._monitoringActive = false;
      console.log('[GracefulDegradation] Monitoring stopped');
    }
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.stopMonitoring();
      this.healthChecks.clear();
      this.disabledFeatures.clear();
      this.currentLevel = this.degradationLevels.FULL;
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[GracefulDegradation] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[GracefulDegradation] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  GracefulDegradationManager
};
