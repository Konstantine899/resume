/**
 * Agent Integration Helper
 * Version: 1.0.0
 * 
 * Упрощает интеграцию плагинов в агентов
 * Предоставляет единый интерфейс для logging, metrics, guard
 */

const { getLogger } = require('./structured-logging.js');
const { getCollector } = require('./agent-metrics.js');
const { GuardTieredSecurity } = require('./guard-tiered-security.js');

class AgentIntegration {
  constructor(agentName) {
    this.agentName = agentName;
    this.logger = null;
    this.metrics = null;
    this.guard = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }

    const startTime = Date.now();

    try {
      // Инициализация плагинов
      this.logger = getLogger();
      await this.logger.init({ logLevel: 'INFO' });

      this.metrics = getCollector();
      await this.metrics.init({ exportInterval: 60000 });

      this.guard = new GuardTieredSecurity();
      await this.guard.init();

      this.initialized = true;

      const latency = Date.now() - startTime;
      console.log(`[AgentIntegration] ${this.agentName} initialized in ${latency}ms`);
      
      return { status: 'initialized', latency };
      
    } catch (error) {
      console.error(`[AgentIntegration] ${this.agentName} init failed:`, error.message);
      throw error;
    }
  }

  startTrace(taskName) {
    if (!this.logger) {
      console.warn(`[AgentIntegration] ${this.agentName} not initialized`);
      return;
    }
    
    this.logger.startTrace(this.agentName);
    this.logger.startSpan(taskName);
    this._startTime = Date.now();
  }

  endTrace(taskName, status = 'success', metadata = {}) {
    if (!this.logger || !this._startTime) {
      return;
    }

    const duration = Date.now() - this._startTime;
    
    this.logger.endSpan(taskName, duration, status, metadata);
    this.logger.endTrace(status);

    // Автоматическая запись метрик
    if (this.metrics) {
      this.metrics.record('agent_call', this.agentName, duration, {
        status,
        task: taskName,
        ...metadata
      });
    }
  }

  async guardCheck(operation, path, context = {}) {
    if (!this.guard) {
      console.warn(`[AgentIntegration] ${this.agentName} guard not initialized`);
      return { approved: true, tier: 'unknown' };
    }

    return await this.guard.check(operation, path, {
      agent: this.agentName,
      ...context
    });
  }

  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }

    const results = {};

    try {
      if (this.logger) {
        results.logger = await this.logger.shutdown();
      }

      if (this.metrics) {
        results.metrics = await this.metrics.shutdown();
      }

      if (this.guard) {
        results.guard = await this.guard.shutdown();
      }

      this.initialized = false;
      console.log(`[AgentIntegration] ${this.agentName} shutdown complete`);
      
      return { status: 'shutdown_complete', results };
      
    } catch (error) {
      console.error(`[AgentIntegration] ${this.agentName} shutdown failed:`, error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

// Factory function для создания инстансов
function createAgentIntegration(agentName) {
  return new AgentIntegration(agentName);
}

// Singleton для каждого агента
const instances = new Map();

function getAgentIntegration(agentName) {
  if (!instances.has(agentName)) {
    instances.set(agentName, new AgentIntegration(agentName));
  }
  return instances.get(agentName);
}

// Cleanup всех инстансов при shutdown
async function shutdownAll() {
  const results = [];
  for (const [name, instance] of instances) {
    try {
      const result = await instance.shutdown();
      results.push({ name, ...result });
    } catch (error) {
      results.push({ name, error: error.message });
    }
  }
  instances.clear();
  console.log('[AgentIntegration] All instances shutdown complete');
  return results;
}

module.exports = {
  AgentIntegration,
  createAgentIntegration,
  getAgentIntegration,
  shutdownAll
};
