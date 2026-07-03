/**
 * Guard Tiered Security Plugin
 * Version: 1.0.0
 * 
 * @plugin guard-tiered-security
 * @version 1.0.0
 * @lifecycle init,health,check,shutdown
 * @dependencies structured-logging, circuit-breaker
 */

class GuardTieredSecurity {
  constructor(options = {}) {
    this.tiers = {
      high: {
        operations: options.highOperations || ['filesystem:delete', 'shell:*', 'mcp:write', 'config:*'],
        checkType: 'premoderation',
        latency: '~300ms'
      },
      medium: {
        operations: options.mediumOperations || ['filesystem:write', 'memory:write', 'agent:create'],
        checkType: 'postmoderation',
        latency: '~50ms'
      },
      low: {
        operations: options.lowOperations || ['filesystem:read', 'memory:read', 'context7:query'],
        checkType: 'sampling',
        latency: '~10ms'
      }
    };
    
    this.sampling = options.sampling || { enabled: true, rate: 0.01, alertOnAnomaly: true };
    
    this.initialized = false;
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalChecks: 0,
      byTier: { high: 0, medium: 0, low: 0 },
      premoderation: 0,
      postmoderation: 0,
      sampling: 0,
      blocked: 0,
      anomalies: 0
    };
    
    this.postModerationQueue = [];
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.highOperations) this.tiers.high.operations = config.highOperations;
      if (config.mediumOperations) this.tiers.medium.operations = config.mediumOperations;
      if (config.lowOperations) this.tiers.low.operations = config.lowOperations;
      if (config.sampling) this.sampling = config.sampling;
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[GuardTieredSecurity] Initialized');
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
      const queueSize = this.postModerationQueue.length;
      const isHealthy = queueSize < 100;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        queueSize,
        totalChecks: this.metrics.totalChecks
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
  
  getTier(operation, path = null) {
    const opKey = operation + (path ? ':' + path : '');
    
    for (const pattern of this.tiers.high.operations) {
      if (this._matchPattern(opKey, pattern)) return 'high';
    }
    
    for (const pattern of this.tiers.medium.operations) {
      if (this._matchPattern(opKey, pattern)) return 'medium';
    }
    
    return 'low';
  }
  
  async check(operation, path, context = {}) {
    this.metrics.totalChecks++;
    const tier = this.getTier(operation, path);
    this.metrics.byTier[tier]++;
    
    switch (tier) {
      case 'high': return await this._highTierCheck(operation, path, context);
      case 'medium': return await this._mediumTierCheck(operation, path, context);
      case 'low': return await this._lowTierCheck(operation, path, context);
      default: return { approved: true, tier: 'unknown' };
    }
  }
  
  async _highTierCheck(operation, path, context) {
    this.metrics.premoderation++;
    console.log('[Guard:HIGH] Premoderation: ' + operation + ' ' + path);
    
    const checks = [
      this._checkPromptInjection(context),
      this._checkPathTraversal(path),
      this._checkCredentials(context)
    ];
    
    const results = await Promise.all(checks);
    const blocked = results.some(r => r.blocked);
    
    if (blocked) {
      this.metrics.blocked++;
      const reason = results.find(r => r.blocked)?.reason || 'Security violation';
      console.warn('[Guard:HIGH] BLOCKED: ' + reason);
      
      return { approved: false, tier: 'high', checkType: 'premoderation', reason, timestamp: Date.now() };
    }
    
    if (this._requiresUserConfirm(operation, path)) {
      return { approved: false, tier: 'high', checkType: 'premoderation', requiresUserConfirm: true, timestamp: Date.now() };
    }
    
    return { approved: true, tier: 'high', checkType: 'premoderation', latency: '~300ms', timestamp: Date.now() };
  }
  
  async _mediumTierCheck(operation, path, context) {
    this.metrics.postmoderation++;
    console.log('[Guard:MEDIUM] Postmoderation: ' + operation + ' ' + path);
    
    this.postModerationQueue.push({ operation, path, context, timestamp: Date.now() });
    this._asyncPostModerationCheck(operation, path, context);
    
    return { approved: true, tier: 'medium', checkType: 'postmoderation', latency: '~50ms', timestamp: Date.now() };
  }
  
  async _asyncPostModerationCheck(operation, path, context) {
    const checks = [this._checkPromptInjection(context), this._checkPathTraversal(path)];
    const results = await Promise.all(checks);
    const blocked = results.some(r => r.blocked);
    
    if (blocked) {
      this.metrics.anomalies++;
      console.warn('[Guard:MEDIUM] ANOMALY: ' + operation + ' ' + path);
    }
    
    this.postModerationQueue = this.postModerationQueue.filter(item => item.timestamp > Date.now() - 60000);
  }
  
  async _lowTierCheck(operation, path, context) {
    this.metrics.sampling++;
    const shouldSample = Math.random() < this.sampling.rate;
    
    if (shouldSample) {
      console.log('[Guard:LOW] Sampling: ' + operation + ' ' + path);
      const injectionCheck = await this._checkPromptInjection(context);
      
      if (injectionCheck.blocked) {
        this.metrics.anomalies++;
        return { approved: false, tier: 'low', checkType: 'sampling', reason: 'Prompt injection', timestamp: Date.now() };
      }
    }
    
    return { approved: true, tier: 'low', checkType: 'sampling', latency: '~10ms', sampled: shouldSample, timestamp: Date.now() };
  }
  
  async _checkPromptInjection(context) {
    const patterns = [
      /ignores+(previous|these|all)s+(instructions|rules)/i,
      /yous+ares+nows+(ins+)?(developers+)?mode/i,
      /bypasss+(security|filters|restrictions)/i,
      /executes+(thiss+)?code/i
    ];
    
    const text = JSON.stringify(context).toLowerCase();
    
    for (const pattern of patterns) {
      if (pattern.test(text)) return { blocked: true, reason: 'Prompt injection detected' };
    }
    
    return { blocked: false };
  }
  
  async _checkPathTraversal(path) {
    const dangerousPatterns = [/\.\.\//, /\/etc\/passwd/, /\/windows\/system32/i];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(path)) return { blocked: true, reason: 'Path traversal detected' };
    }
    
    return { blocked: false };
  }
  
  async _checkCredentials(context) {
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
    const text = JSON.stringify(context).toLowerCase();
    
    for (const key of sensitiveKeys) {
      if (text.includes(key)) return { blocked: true, reason: 'Credentials detected' };
    }
    
    return { blocked: false };
  }
  
  _requiresUserConfirm(operation, path) {
    const requiresConfirm = ['config:write', 'agent:create', 'agent:delete', 'mcp:modify'];
    return requiresConfirm.some(pattern => operation.includes(pattern) || (path && path.includes(pattern)));
  }
  
  _matchPattern(str, pattern) {
    // Wildcard pattern (shell:*)
    if (pattern.endsWith('*')) {
      return str.startsWith(pattern.slice(0, -1));
    }
    
    // Exact match
    if (str === pattern) {
      return true;
    }
    
    // Partial match for operation prefixes
    if (str.startsWith(pattern + ':')) {
      return true;
    }
    
    return false;
  }
  
  getStats() {
    const total = this.metrics.totalChecks;
    if (total === 0) return { avgLatency: '0ms', ...this.metrics };
    
    const latencies = { high: 300, medium: 50, low: 10 };
    const weightedSum = 
      (this.metrics.byTier.high * latencies.high) +
      (this.metrics.byTier.medium * latencies.medium) +
      (this.metrics.byTier.low * latencies.low);
    
    return {
      ...this.metrics,
      avgLatency: Math.round(weightedSum / total) + 'ms',
      queueSize: this.postModerationQueue.length
    };
  }
  
  resetMetrics() {
    this.metrics = {
      totalChecks: 0,
      byTier: { high: 0, medium: 0, low: 0 },
      premoderation: 0,
      postmoderation: 0,
      sampling: 0,
      blocked: 0,
      anomalies: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.postModerationQueue = [];
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[GuardTieredSecurity] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[GuardTieredSecurity] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = { GuardTieredSecurity };
