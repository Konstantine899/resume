/**
 * Agent Metrics Dashboard Plugin
 * Version: 1.0.0
 * 
 * @plugin agent-metrics
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging
 */

const fs = require('fs');
const path = require('path');

class AgentMetricsCollector {
  constructor(options = {}) {
    this.metricsFile = options.metricsFile || '.opencode/metrics/metrics.jsonl';
    this.exportInterval = options.exportInterval || 60000;
    this.retentionDays = options.retentionDays || 7;
    
    this.initialized = false;
    this.exportTimer = null;
    
    this.metrics = {
      agents: {},
      mcp: {},
      pipelines: {},
      system: { startTime: Date.now(), totalRequests: 0, totalErrors: 0 }
    };
    
    this.counters = { agentCalls: {}, mcpCalls: {}, pipelineRuns: {} };
    this.histograms = { agentLatency: {}, mcpLatency: {}, pipelineDuration: {} };
    
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
      if (config.metricsFile) this.metricsFile = config.metricsFile;
      if (config.exportInterval) this.exportInterval = config.exportInterval;
      if (config.retentionDays) this.retentionDays = config.retentionDays;
      
      this._ensureDirectory();
      this._startPeriodicExport();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[AgentMetrics] Initialized');
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
      const isHealthy = this.initialized && this.exportTimer !== null;
      
      this.healthStatus = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
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
    const dir = path.dirname(this.metricsFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  
  record(metricType, name, value, metadata = {}) {
    const timestamp = Date.now();
    const entry = { timestamp, type: metricType, name, value, metadata };
    this._updateAggregates(metricType, name, value, metadata);
    this._writeMetric(entry);
    this.metrics.system.totalRequests++;
  }
  
  _updateAggregates(metricType, name, value, metadata) {
    if (metricType === 'agent_call') this._recordAgentCall(name, value, metadata);
    else if (metricType === 'mcp_call') this._recordMcpCall(name, value, metadata);
    else if (metricType === 'pipeline_run') this._recordPipelineRun(name, value, metadata);
    if (metadata.status === 'error') this.metrics.system.totalErrors++;
  }
  
  _recordAgentCall(agentName, duration, metadata) {
    if (!this.counters.agentCalls[agentName]) {
      this.counters.agentCalls[agentName] = 0;
      this.histograms.agentLatency[agentName] = [];
    }
    this.counters.agentCalls[agentName]++;
    this.histograms.agentLatency[agentName].push({ duration, timestamp: Date.now(), status: metadata.status || 'success' });
    if (this.histograms.agentLatency[agentName].length > 1000) this.histograms.agentLatency[agentName].shift();
  }
  
  _recordMcpCall(mcpServer, duration, metadata) {
    if (!this.counters.mcpCalls[mcpServer]) {
      this.counters.mcpCalls[mcpServer] = 0;
      this.histograms.mcpLatency[mcpServer] = [];
    }
    this.counters.mcpCalls[mcpServer]++;
    this.histograms.mcpLatency[mcpServer].push({ duration, timestamp: Date.now(), status: metadata.status || 'success' });
    if (this.histograms.mcpLatency[mcpServer].length > 1000) this.histograms.mcpLatency[mcpServer].shift();
  }
  
  _recordPipelineRun(pipelineName, duration, metadata) {
    if (!this.counters.pipelineRuns[pipelineName]) {
      this.counters.pipelineRuns[pipelineName] = 0;
      this.histograms.pipelineDuration[pipelineName] = [];
    }
    this.counters.pipelineRuns[pipelineName]++;
    this.histograms.pipelineDuration[pipelineName].push({ duration, timestamp: Date.now(), status: metadata.status || 'success', steps: metadata.steps || 0 });
    if (this.histograms.pipelineDuration[pipelineName].length > 100) this.histograms.pipelineDuration[pipelineName].shift();
  }
  
  _writeMetric(entry) {
    try {
      const line = JSON.stringify(entry);
      fs.appendFileSync(this.metricsFile, line + '\n', 'utf8');
    } catch (error) {
      console.warn('[AgentMetrics] Write failed:', error.message);
    }
  }
  
  _startPeriodicExport() {
    this.exportTimer = setInterval(() => {
      this._exportSummary();
      this._cleanupOldMetrics();
    }, this.exportInterval);
  }
  
  _exportSummary() {
    const summary = {
      timestamp: Date.now(),
      type: 'summary',
      agents: this.getAgentStats(),
      mcp: this.getMcpStats(),
      pipelines: this.getPipelineStats(),
      system: this.metrics.system
    };
    const summaryFile = this.metricsFile.replace('.jsonl', '-summary.json');
    try {
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
      console.log('[AgentMetrics] Summary exported');
    } catch (error) {
      console.warn('[AgentMetrics] Summary export failed:', error.message);
    }
  }
  
  _cleanupOldMetrics() {
    try {
      const cutoff = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
      if (fs.existsSync(this.metricsFile)) {
        const content = fs.readFileSync(this.metricsFile, 'utf8');
        const lines = content.split('\n').filter(line => {
          if (!line.trim()) return false;
          try {
            const entry = JSON.parse(line);
            return entry.timestamp > cutoff;
          } catch { return false; }
        });
        fs.writeFileSync(this.metricsFile, lines.join('\n') + '\n', 'utf8');
      }
    } catch (error) {
      console.warn('[AgentMetrics] Cleanup failed:', error.message);
    }
  }
  
  getAgentStats() {
    const stats = {};
    for (const [agent, count] of Object.entries(this.counters.agentCalls)) {
      const latencies = this.histograms.agentLatency[agent] || [];
      stats[agent] = {
        totalCalls: count,
        p50: this._percentile(latencies, 50),
        p95: this._percentile(latencies, 95),
        p99: this._percentile(latencies, 99),
        errorRate: this._errorRate(latencies)
      };
    }
    return stats;
  }
  
  getMcpStats() {
    const stats = {};
    for (const [server, count] of Object.entries(this.counters.mcpCalls)) {
      const latencies = this.histograms.mcpLatency[server] || [];
      stats[server] = {
        totalCalls: count,
        p50: this._percentile(latencies, 50),
        p95: this._percentile(latencies, 95),
        p99: this._percentile(latencies, 99),
        errorRate: this._errorRate(latencies)
      };
    }
    return stats;
  }
  
  getPipelineStats() {
    const stats = {};
    for (const [pipeline, count] of Object.entries(this.counters.pipelineRuns)) {
      const durations = this.histograms.pipelineDuration[pipeline] || [];
      stats[pipeline] = {
        totalRuns: count,
        p50: this._percentile(durations, 50),
        p95: this._percentile(durations, 95),
        p99: this._percentile(durations, 99),
        successRate: 100 - this._errorRate(durations)
      };
    }
    return stats;
  }
  
  _percentile(data, p) {
    if (data.length === 0) return 0;
    const values = data.map(d => d.duration).sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)] || 0;
  }
  
  _errorRate(data) {
    if (data.length === 0) return 0;
    const errors = data.filter(d => d.status === 'error').length;
    return (errors / data.length) * 100;
  }
  
  getAllMetrics() {
    return {
      agents: this.getAgentStats(),
      mcp: this.getMcpStats(),
      pipelines: this.getPipelineStats(),
      system: this.metrics.system,
      uptime: Date.now() - this.metrics.system.startTime
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this.exportTimer) {
        clearInterval(this.exportTimer);
        this.exportTimer = null;
      }
      
      this._exportSummary();
      
      this.initialized = false;
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[AgentMetrics] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[AgentMetrics] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

let globalCollector = null;

function getCollector(options) {
  if (!globalCollector) {
    globalCollector = new AgentMetricsCollector(options);
  }
  return globalCollector;
}

module.exports = { AgentMetricsCollector, getCollector };
