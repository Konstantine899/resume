/**
 * Dependency Graph Plugin
 * Version: 1.0.0
 * 
 * Topological sort for plugin load order
 * 
 * @plugin dependency-graph
 * @version 1.0.0
 * @lifecycle init,health,computeOrder,shutdown
 * @dependencies structured-logging
 */

const fs = require('fs');
const path = require('path');

class DependencyGraph {
  constructor(options = {}) {
    this.registryPath = options.registryPath || '.opencode/registry.json';
    this.initialized = false;
    this.registry = null;
    this.graph = new Map();
    this.loadOrder = [];
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.registryPath) this.registryPath = config.registryPath;
      
      this.registry = this._loadRegistry();
      this._buildGraph();
      this.loadOrder = this._topologicalSort();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        nodeCount: this.graph.size,
        loadOrderLength: this.loadOrder.length
      };
      
      console.log('[DependencyGraph] Initialized with ' + this.loadOrder.length + ' plugins');
      return { status: 'initialized', latency: Date.now() - startTime, loadOrder: this.loadOrder };
      
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
      const registryExists = fs.existsSync(this.registryPath);
      const hasValidOrder = this.loadOrder.length > 0;
      
      this.healthStatus = {
        status: registryExists && hasValidOrder ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        registryExists,
        hasValidOrder,
        nodeCount: this.graph.size
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
  
  _loadRegistry() {
    if (!fs.existsSync(this.registryPath)) {
      throw new Error('Registry not found: ' + this.registryPath);
    }
    
    const content = fs.readFileSync(this.registryPath, 'utf8');
    return JSON.parse(content);
  }
  
  _buildGraph() {
    this.graph.clear();
    
    const plugins = this.registry?.plugins || [];
    
    for (const plugin of plugins) {
      const pluginName = plugin.name;
      
      if (!this.graph.has(pluginName)) {
        this.graph.set(pluginName, []);
      }
      
      const deps = plugin.dependencies || [];
      for (const dep of deps) {
        if (!this.graph.has(dep)) {
          this.graph.set(dep, []);
        }
        this.graph.get(pluginName).push(dep);
      }
    }
    
    console.log('[DependencyGraph] Built graph with ' + this.graph.size + ' nodes');
  }
  
  _topologicalSort() {
    const visited = new Set();
    const result = [];
    
    const visit = (node) => {
      if (visited.has(node)) {
        return;
      }
      
      visited.add(node);
      
      const dependencies = this.graph.get(node) || [];
      for (const dep of dependencies) {
        visit(dep);
      }
      
      result.push(node);
    };
    
    for (const [node] of this.graph) {
      visit(node);
    }
    
    return result;
  }
  
  getLoadOrder() {
    return [...this.loadOrder];
  }
  
  getDependencies(pluginName) {
    const registry = this._loadRegistry();
    const plugin = registry.plugins?.find(p => p.name === pluginName);
    return plugin?.dependencies || [];
  }
  
  getDependents(pluginName) {
    return this.graph.get(pluginName) || [];
  }
  
  hasCycle() {
    try {
      this._topologicalSort();
      return false;
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        return true;
      }
      throw error;
    }
  }
  
  validate() {
    const issues = [];
    
    if (!this.registry) {
      issues.push('Registry not loaded');
      return { valid: false, issues };
    }
    
    const plugins = new Set((this.registry.plugins || []).map(p => p.name));
    
    for (const plugin of this.registry.plugins || []) {
      for (const dep of plugin.dependencies || []) {
        if (!plugins.has(dep)) {
          issues.push(`Plugin '${plugin.name}' depends on unknown '${dep}'`);
        }
      }
    }
    
    try {
      this._topologicalSort();
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        issues.push(error.message);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      loadOrder: this.loadOrder
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.graph.clear();
      this.loadOrder = [];
      this.registry = null;
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[DependencyGraph] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[DependencyGraph] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

class CircularDependencyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircularDependencyError';
    this.timestamp = Date.now();
  }
}

module.exports = {
  DependencyGraph,
  CircularDependencyError
};
