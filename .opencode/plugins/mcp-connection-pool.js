/**
 * MCP Connection Pooling Plugin
 * Version: 1.0.0
 * 
 * @plugin mcp-connection-pool
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging, circuit-breaker
 */

class MCPConnectionPool {
  constructor(options = {}) {
    this.maxPoolSize = options.maxPoolSize || 10;
    this.minPoolSize = options.minPoolSize || 2;
    this.idleTimeout = options.idleTimeout || 300000;
    this.connectionTimeout = options.connectionTimeout || 30000;
    
    this.initialized = false;
    this.pools = new Map();
    this._maintenanceTimer = null;
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalConnections: 0,
      pooledConnections: 0,
      newConnections: 0,
      reusedConnections: 0,
      timedOutConnections: 0,
      poolHits: 0,
      poolMisses: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.maxPoolSize) this.maxPoolSize = config.maxPoolSize;
      if (config.minPoolSize) this.minPoolSize = config.minPoolSize;
      if (config.idleTimeout) this.idleTimeout = config.idleTimeout;
      if (config.connectionTimeout) this.connectionTimeout = config.connectionTimeout;
      
      this._startPoolMaintenance();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        poolCount: this.pools.size,
        totalConnections: this.metrics.totalConnections
      };
      
      console.log('[MCPConnectionPool] Initialized (min: ' + this.minPoolSize + ', max: ' + this.maxPoolSize + ')');
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
      let totalAvailable = 0;
      let totalInUse = 0;
      
      for (const pool of this.pools.values()) {
        totalAvailable += pool.filter(c => c.available && !c.inUse).length;
        totalInUse += pool.filter(c => c.inUse).length;
      }
      
      const isHealthy = totalAvailable >= this.minPoolSize;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        poolCount: this.pools.size,
        totalConnections: this.metrics.totalConnections,
        available: totalAvailable,
        inUse: totalInUse
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
  
  async getConnection(server, createFn) {
    const pool = this._getOrCreatePool(server);
    const connection = this._getAvailableConnection(pool);
    
    if (connection) {
      this.metrics.reusedConnections++;
      this.metrics.poolHits++;
      console.log('[MCPConnectionPool] Reusing connection for: ' + server);
      return connection;
    }
    
    this.metrics.poolMisses++;
    const newConnection = await this._createConnection(server, createFn, pool);
    this.metrics.newConnections++;
    return newConnection;
  }
  
  _getOrCreatePool(server) {
    if (!this.pools.has(server)) {
      this.pools.set(server, []);
      console.log('[MCPConnectionPool] Created pool for: ' + server);
    }
    return this.pools.get(server);
  }
  
  _getAvailableConnection(pool) {
    for (const connection of pool) {
      if (connection.available && !connection.inUse && this._isHealthy(connection)) {
        connection.inUse = true;
        connection.lastUsed = Date.now();
        return connection;
      }
    }
    return null;
  }
  
  async _createConnection(server, createFn, pool) {
    if (pool.length >= this.maxPoolSize) {
      return await this._waitForConnection(server, pool);
    }
    
    const connection = {
      id: 'conn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      server,
      resource: null,
      available: false,
      inUse: true,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 0
    };
    
    try {
      connection.resource = await createFn(server);
      connection.available = true;
      pool.push(connection);
      this.metrics.totalConnections++;
      this.metrics.pooledConnections++;
      console.log('[MCPConnectionPool] Created connection: ' + connection.id);
      return connection;
    } catch (error) {
      console.error('[MCPConnectionPool] Connection failed:', error.message);
      throw error;
    }
  }
  
  _waitForConnection(server, pool) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'));
        this.metrics.timedOutConnections++;
      }, this.connectionTimeout);
      
      const checkInterval = setInterval(() => {
        const connection = this._getAvailableConnection(pool);
        if (connection) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          resolve(connection);
        }
      }, 50);
    });
  }
  
  returnConnection(connection) {
    connection.inUse = false;
    connection.useCount++;
    connection.lastUsed = Date.now();
    console.log('[MCPConnectionPool] Returned: ' + connection.id + ' (uses: ' + connection.useCount + ')');
  }
  
  removeConnection(connection) {
    const pool = this.pools.get(connection.server);
    if (pool) {
      const index = pool.indexOf(connection);
      if (index > -1) {
        pool.splice(index, 1);
        this.metrics.totalConnections--;
        this.metrics.pooledConnections--;
        console.log('[MCPConnectionPool] Removed: ' + connection.id);
      }
    }
  }
  
  _isHealthy(connection) {
    const idleTime = Date.now() - connection.lastUsed;
    return idleTime <= this.idleTimeout && connection.resource !== null;
  }
  
  _startPoolMaintenance() {
    this._maintenanceTimer = setInterval(() => {
      this._cleanupIdleConnections();
      this._ensureMinPoolSize();
    }, 60000);
    console.log('[MCPConnectionPool] Maintenance started');
  }
  
  _cleanupIdleConnections() {
    for (const [server, pool] of this.pools) {
      const toRemove = pool.filter(c => !c.inUse && !this._isHealthy(c));
      for (const connection of toRemove) {
        this.removeConnection(connection);
      }
      if (toRemove.length > 0) {
        console.log('[MCPConnectionPool] Cleaned up ' + toRemove.length + ' idle for ' + server);
      }
    }
  }
  
  _ensureMinPoolSize() {
    for (const [server, pool] of this.pools) {
      const available = pool.filter(c => c.available && !c.inUse).length;
      if (available < this.minPoolSize) {
        console.log('[MCPConnectionPool] Ensuring min pool for ' + server);
      }
    }
  }
  
  getStats() {
    const pools = {};
    for (const [server, pool] of this.pools) {
      pools[server] = {
        size: pool.length,
        available: pool.filter(c => c.available && !c.inUse).length,
        inUse: pool.filter(c => c.inUse).length
      };
    }
    
    const total = this.metrics.reusedConnections + this.metrics.newConnections;
    const reuseRate = total > 0 ? (this.metrics.reusedConnections / total * 100).toFixed(2) : 0;
    
    return {
      totalPools: this.pools.size,
      totalConnections: this.metrics.totalConnections,
      pools,
      metrics: Object.assign({}, this.metrics),
      reuseRate: reuseRate + '%',
      overheadReduction: (1 - (this.metrics.newConnections / (this.metrics.totalConnections || 1))) * 100
    };
  }
  
  async clearAll() {
    for (const [server, pool] of this.pools) {
      for (const connection of pool) {
        if (connection.resource && connection.resource.close) {
          await connection.resource.close();
        }
      }
    }
    this.pools.clear();
    this.metrics.totalConnections = 0;
    this.metrics.pooledConnections = 0;
    console.log('[MCPConnectionPool] All pools cleared');
  }
  
  resetMetrics() {
    this.metrics = {
      totalConnections: 0,
      pooledConnections: 0,
      newConnections: 0,
      reusedConnections: 0,
      timedOutConnections: 0,
      poolHits: 0,
      poolMisses: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this._maintenanceTimer) {
        clearInterval(this._maintenanceTimer);
        this._maintenanceTimer = null;
      }
      
      await this.clearAll();
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[MCPConnectionPool] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[MCPConnectionPool] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = { MCPConnectionPool };
