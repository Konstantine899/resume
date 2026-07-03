/**
 * Health Dashboard Plugin
 * Version: 1.0.0
 * 
 * Unified health monitoring для всех плагинов, MCP серверов и агентов
 * 
 * @plugin health-dashboard
 * @version 1.0.0
 * @lifecycle init,health,checkAll,shutdown
 * @dependencies structured-logging, agent-metrics
 */

const fs = require('fs');
const path = require('path');

class HealthDashboard {
  constructor(options = {}) {
    this.dashboardFile = options.dashboardFile || '.opencode/health/dashboard.json';
    this.alertsFile = options.alertsFile || '.opencode/health/alerts.jsonl';
    this.checkInterval = options.checkInterval || 30000;
    
    this.initialized = false;
    this._checkTimer = null;
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalChecks: 0,
      healthyChecks: 0,
      degradedChecks: 0,
      unhealthyChecks: 0,
      alertsTriggered: 0
    };
    
    this._ensureDirectory();
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.dashboardFile) this.dashboardFile = config.dashboardFile;
      if (config.alertsFile) this.alertsFile = config.alertsFile;
      if (config.checkInterval) this.checkInterval = config.checkInterval;
      
      this._ensureDirectory();
      this._startPeriodicCheck();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[HealthDashboard] Initialized');
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
      const dashboardExists = fs.existsSync(this.dashboardFile);
      
      this.healthStatus = {
        status: dashboardExists ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        dashboardExists
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
    const dir = path.dirname(this.dashboardFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  _startPeriodicCheck() {
    this._checkTimer = setInterval(async () => {
      await this.checkAll();
    }, this.checkInterval);
    
    console.log('[HealthDashboard] Periodic check started (interval: ' + this.checkInterval + 'ms)');
  }
  
  async checkAll() {
    const startTime = Date.now();
    this.metrics.totalChecks++;
    
    try {
      const result = {
        timestamp: Date.now(),
        overall: 'healthy',
        plugins: {},
        mcpServers: {},
        agents: {},
        summary: {
          total: 0,
          healthy: 0,
          degraded: 0,
          unhealthy: 0
        }
      };
      
      // Check plugins
      const plugins = [
        'structured-logging',
        'circuit-breaker',
        'memory-atomic',
        'serena-fallback',
        'context7-cache',
        'guard-tiered-security',
        'agent-metrics',
        'memory-versioning',
        'encrypted-audit-logs',
        'adaptive-parallel-mcp',
        'request-deduplication',
        'graceful-degradation',
        'mcp-connection-pool',
        'dependency-graph',
        'agent-integration'
      ];
      
      for (const pluginName of plugins) {
        try {
          const PluginClass = require(`./${pluginName}.js`);
          const plugin = new PluginClass();
          
          // Инициализация перед health check
          try {
            await plugin.init();
          } catch (initError) {
            // Игнорируем ошибки инициализации (плагин может быть уже инициализирован)
          }
          
          const health = await plugin.health();
          
          result.plugins[pluginName] = health;
          result.summary.total++;
          
          if (health.status === 'healthy') {
            result.summary.healthy++;
          } else if (health.status === 'degraded') {
            result.summary.degraded++;
            if (result.overall === 'healthy') {
              result.overall = 'degraded';
            }
          } else {
            result.summary.unhealthy++;
            result.overall = 'unhealthy';
          }
          
          await plugin.shutdown();
          
        } catch (error) {
          result.plugins[pluginName] = {
            status: 'unhealthy',
            error: error.message
          };
          result.summary.total++;
          result.summary.unhealthy++;
          result.overall = 'unhealthy';
          
          this._triggerAlert('plugin_unhealthy', 'critical', {
            plugin: pluginName,
            error: error.message
          });
        }
      }
      
      // Check MCP servers (from registry)
      const registryPath = path.join(__dirname, '../registry.json');
      if (fs.existsSync(registryPath)) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        
        for (const [serverName, serverConfig] of Object.entries(registry.mcpServers || {})) {
          result.mcpServers[serverName] = {
            status: serverConfig.status || 'unknown',
            type: serverConfig.type,
            timeout: serverConfig.timeout
          };
          
          result.summary.total++;
          if (serverConfig.status === 'active') {
            result.summary.healthy++;
          } else {
            result.summary.degraded++;
            if (result.overall === 'healthy') {
              result.overall = 'degraded';
            }
          }
        }
      }
      
      // Check agents (from registry)
      if (fs.existsSync(registryPath)) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        
        for (const agent of registry.agents || []) {
          result.agents[agent.name] = {
            status: agent.status || 'unknown',
            priority: agent.priority
          };
          
          result.summary.total++;
          if (agent.status === 'active') {
            result.summary.healthy++;
          } else {
            result.summary.degraded++;
          }
        }
      }
      
      // Save dashboard
      this._saveDashboard(result);
      
      // Update metrics
      this.metrics.healthyChecks += result.summary.healthy;
      this.metrics.degradedChecks += result.summary.degraded;
      this.metrics.unhealthyChecks += result.summary.unhealthy;
      
      const latency = Date.now() - startTime;
      console.log(`[HealthDashboard] Check complete: ${result.overall} (${result.summary.healthy}/${result.summary.total} healthy) in ${latency}ms`);
      
      return result;
      
    } catch (error) {
      console.error('[HealthDashboard] Check failed:', error.message);
      this._triggerAlert('health_check_failed', 'critical', {
        error: error.message
      });
      
      return {
        timestamp: Date.now(),
        overall: 'unhealthy',
        error: error.message
      };
    }
  }
  
  _saveDashboard(result) {
    try {
      const tempPath = this.dashboardFile + '.tmp.' + Date.now();
      fs.writeFileSync(tempPath, JSON.stringify(result, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dashboardFile);
    } catch (error) {
      console.error('[HealthDashboard] Save failed:', error.message);
    }
  }
  
  _triggerAlert(type, severity, data) {
    this.metrics.alertsTriggered++;
    
    const alert = {
      timestamp: Date.now(),
      type,
      severity,
      data,
      acknowledged: false
    };
    
    try {
      const line = JSON.stringify(alert);
      fs.appendFileSync(this.alertsFile, line + '\n', 'utf8');
      console.log(`[HealthDashboard] Alert triggered: ${type} (${severity})`);
    } catch (error) {
      console.error('[HealthDashboard] Alert save failed:', error.message);
    }
  }
  
  getAlerts(options = {}) {
    try {
      if (!fs.existsSync(this.alertsFile)) {
        return [];
      }
      
      const content = fs.readFileSync(this.alertsFile, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());
      
      const alerts = [];
      const since = options.since || 0;
      const severity = options.severity;
      
      for (const line of lines) {
        try {
          const alert = JSON.parse(line);
          
          if (alert.timestamp < since) {
            continue;
          }
          
          if (severity && alert.severity !== severity) {
            continue;
          }
          
          alerts.push(alert);
        } catch (error) {
          // Skip invalid lines
        }
      }
      
      return alerts.sort((a, b) => b.timestamp - a.timestamp);
      
    } catch (error) {
      console.error('[HealthDashboard] Get alerts failed:', error.message);
      return [];
    }
  }
  
  getDashboard() {
    try {
      if (!fs.existsSync(this.dashboardFile)) {
        return null;
      }
      
      const content = fs.readFileSync(this.dashboardFile, 'utf8');
      return JSON.parse(content);
      
    } catch (error) {
      console.error('[HealthDashboard] Get dashboard failed:', error.message);
      return null;
    }
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this._checkTimer) {
        clearInterval(this._checkTimer);
        this._checkTimer = null;
      }
      
      // Final check and save
      await this.checkAll();
      
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[HealthDashboard] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[HealthDashboard] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  HealthDashboard
};
