/**
 * Rate Limiter Plugin v2.0
 * Multi-tier rate limiting for DoS protection
 * 
 * Tiers:
 * - Per-minute (sliding window)
 * - Per-hour (sliding window)
 * - Per-session (counter)
 * - Global (concurrent sessions)
 */

const crypto = require('crypto');

class RateLimiter {
  constructor(options = {}) {
    this.options = {
      // Per-minute limits
      perMinute: {
        files: { limit: 10, windowMs: 60000, delay: 5000 },
        mcp: { limit: 5, windowMs: 60000, delay: 3000 },
        shell: { limit: 3, windowMs: 60000, delay: 10000 },
      },
      // Per-hour limits
      perHour: {
        files: { limit: 100, windowMs: 3600000, blockMs: 3600000 },
        mcp: { limit: 50, windowMs: 3600000, blockMs: 1800000 },
        tokens: { limit: 500000, windowMs: 3600000, blockMs: 3600000 },
      },
      // Per-session limits
      perSession: {
        files: { limit: 50 },
        mcp: { limit: 20 },
        shell: { limit: 10 },
        tokensIn: { limit: 100000 },
        tokensOut: { limit: 50000 },
      },
      // Global limits
      global: {
        maxConcurrentSessions: 3,
        maxSessionsPerIP: 5,
        maxTokensPerHour: 1000000,
      },
      ...options,
    };
    
    // Storage
    this.sessions = new Map(); // sessionId -> session data
    this.ipSessions = new Map(); // ip -> Set of sessionIds
    this.windows = new Map(); // userId:type -> { requests: [], blockedUntil: 0 }
    this.globalCounters = {
      tokensPerHour: 0,
      tokensHourReset: Date.now() + 3600000,
    };
    
    // Metrics
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      delayedRequests: 0,
      captchaTriggers: 0,
    };
  }
  
  /**
   * Create new session
   */
  createSession(userId, ip = null) {
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      userId,
      ip,
      createdAt: Date.now(),
      counters: {
        files: 0,
        mcp: 0,
        shell: 0,
        tokensIn: 0,
        tokensOut: 0,
      },
      blockedActions: 0,
      rateLimitViolations: 0,
      trustLevel: 5, // 0-10
    };
    
    this.sessions.set(sessionId, session);
    
    // Track IP sessions
    if (ip) {
      if (!this.ipSessions.has(ip)) {
        this.ipSessions.set(ip, new Set());
      }
      this.ipSessions.get(ip).add(sessionId);
    }
    
    return { sessionId, session };
  }
  
  /**
   * Check rate limit for action
   */
  checkLimit(sessionId, type, count = 1) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { allowed: false, reason: 'Invalid session' };
    }
    
    const now = Date.now();
    this.metrics.totalRequests++;
    
    // Check session limits
    const sessionLimit = this.options.perSession[type];
    if (sessionLimit && session.counters[type] + count > sessionLimit.limit) {
      session.blockedActions++;
      this.metrics.blockedRequests++;
      
      if (session.blockedActions >= 3) {
        return {
          allowed: false,
          reason: 'Session limit exceeded',
          requireCaptcha: true,
        };
      }
      
      return {
        allowed: false,
        reason: `Session limit: ${session.counters[type]}/${sessionLimit.limit}`,
        retryAfter: null, // Session reset required
      };
    }
    
    // Check per-minute limits
    const minuteLimit = this.options.perMinute[type];
    if (minuteLimit) {
      const windowKey = `${sessionId}:${type}:minute`;
      const window = this.getOrCreateWindow(windowKey, minuteLimit.windowMs);
      
      if (window.requests.length + count > minuteLimit.limit) {
        session.rateLimitViolations++;
        this.metrics.blockedRequests++;
        
        const retryAfter = Math.ceil((minuteLimit.windowMs - (now - window.requests[0])) / 1000);
        
        if (session.rateLimitViolations >= 5) {
          return {
            allowed: false,
            reason: 'Too many rate limit violations',
            requireCaptcha: true,
          };
        }
        
        return {
          allowed: false,
          reason: `Per-minute limit: ${window.requests.length}/${minuteLimit.limit}`,
          retryAfter,
          delay: minuteLimit.delay,
        };
      }
    }
    
    // Check per-hour limits
    const hourLimit = this.options.perHour[type];
    if (hourLimit) {
      const windowKey = `${sessionId}:${type}:hour`;
      const window = this.getOrCreateWindow(windowKey, hourLimit.windowMs);
      
      if (window.requests.length + count > hourLimit.limit) {
        session.rateLimitViolations++;
        this.metrics.blockedRequests++;
        
        const retryAfter = Math.ceil((hourLimit.windowMs - (now - window.requests[0])) / 1000);
        
        return {
          allowed: false,
          reason: `Per-hour limit: ${window.requests.length}/${hourLimit.limit}`,
          retryAfter,
          blockMs: hourLimit.blockMs,
        };
      }
    }
    
    // Check global token limit
    if (type === 'tokensIn' || type === 'tokensOut') {
      if (this.globalCounters.tokensPerHour + count > this.options.global.maxTokensPerHour) {
        const retryAfter = Math.ceil((this.globalCounters.tokensHourReset - now) / 1000);
        
        return {
          allowed: false,
          reason: 'Global token limit exceeded',
          retryAfter,
        };
      }
      
      this.globalCounters.tokensPerHour += count;
    }
    
    // Check concurrent sessions
    if (this.sessions.size > this.options.global.maxConcurrentSessions) {
      return {
        allowed: false,
        reason: 'Too many concurrent sessions',
        retryAfter: 60,
      };
    }
    
    // Check IP sessions
    if (session.ip) {
      const ipSessionCount = this.ipSessions.get(session.ip)?.size || 0;
      if (ipSessionCount > this.options.global.maxSessionsPerIP) {
        return {
          allowed: false,
          reason: 'Too many sessions from same IP',
          requireCaptcha: true,
        };
      }
    }
    
    // All checks passed - update counters
    session.counters[type] += count;
    
    if (minuteLimit) {
      const windowKey = `${sessionId}:${type}:minute`;
      const window = this.getOrCreateWindow(windowKey, minuteLimit.windowMs);
      for (let i = 0; i < count; i++) {
        window.requests.push(now);
      }
    }
    
    if (hourLimit) {
      const windowKey = `${sessionId}:${type}:hour`;
      const window = this.getOrCreateWindow(windowKey, hourLimit.windowMs);
      for (let i = 0; i < count; i++) {
        window.requests.push(now);
      }
    }
    
    return { allowed: true, remaining: this.getRemaining(session, type) };
  }
  
  /**
   * Get or create sliding window
   */
  getOrCreateWindow(key, windowMs) {
    const now = Date.now();
    
    if (!this.windows.has(key)) {
      this.windows.set(key, { requests: [], windowMs });
    }
    
    const window = this.windows.get(key);
    
    // Remove old requests outside window
    window.requests = window.requests.filter(
      timestamp => now - timestamp < windowMs
    );
    
    return window;
  }
  
  /**
   * Get remaining quota
   */
  getRemaining(session, type) {
    const sessionLimit = this.options.perSession[type];
    const minuteLimit = this.options.perMinute[type];
    const hourLimit = this.options.perHour[type];
    
    return {
      session: sessionLimit ? sessionLimit.limit - session.counters[type] : null,
      minute: minuteLimit ? minuteLimit.limit - this.getWindowCount(session.id, type, 'minute') : null,
      hour: hourLimit ? hourLimit.limit - this.getWindowCount(session.id, type, 'hour') : null,
    };
  }
  
  /**
   * Get window request count
   */
  getWindowCount(sessionId, type, period) {
    const key = `${sessionId}:${type}:${period}`;
    const window = this.windows.get(key);
    return window ? window.requests.length : 0;
  }
  
  /**
   * Reset session counters
   */
  resetSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.counters = {
        files: 0,
        mcp: 0,
        shell: 0,
        tokensIn: 0,
        tokensOut: 0,
      };
      session.blockedActions = 0;
      session.rateLimitViolations = 0;
    }
  }
  
  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from IP tracking
      if (session.ip) {
        this.ipSessions.get(session.ip)?.delete(sessionId);
      }
      
      // Remove windows
      for (const [key] of this.windows.entries()) {
        if (key.startsWith(sessionId)) {
          this.windows.delete(key);
        }
      }
      
      this.sessions.delete(sessionId);
    }
  }
  
  /**
   * Update session trust level
   */
  updateTrust(sessionId, delta) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.trustLevel = Math.max(0, Math.min(10, session.trustLevel + delta));
    }
  }
  
  /**
   * Get session info
   */
  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      age: Date.now() - session.createdAt,
      counters: session.counters,
      blockedActions: session.blockedActions,
      rateLimitViolations: session.rateLimitViolations,
      trustLevel: session.trustLevel,
      remaining: {
        files: this.getRemaining(session, 'files'),
        mcp: this.getRemaining(session, 'mcp'),
        shell: this.getRemaining(session, 'shell'),
      },
    };
  }
  
  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeSessions: this.sessions.size,
      uniqueIPs: this.ipSessions.size,
      windowsTracked: this.windows.size,
      globalTokensPerHour: this.globalCounters.tokensPerHour,
    };
  }
  
  /**
   * Cleanup old windows (call periodically)
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    
    for (const [key, window] of this.windows.entries()) {
      window.requests = window.requests.filter(
        timestamp => now - timestamp < maxAge
      );
      
      if (window.requests.length === 0) {
        this.windows.delete(key);
      }
    }
    
    // Cleanup old sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt > maxAge) {
        this.endSession(sessionId);
      }
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  RateLimiter,
  
  // Convenience function
  createRateLimiter: (options) => new RateLimiter(options),
};
