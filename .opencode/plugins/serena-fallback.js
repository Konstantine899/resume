/**
 * Serena Fallback Plugin
 * Version: 1.0.0
 * 
 * @plugin serena-fallback
 * @version 1.0.0
 * @lifecycle init,health,metrics,shutdown
 * @dependencies structured-logging, circuit-breaker
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class SerenaFallbackManager {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || '.';
    this.maxFiles = options.maxFiles || 50;
    this.alertOnFallback = options.alertOnFallback !== false;
    this.autoRecovery = options.autoRecovery !== false;
    this.recoveryCheckInterval = options.recoveryCheckInterval || 30000;
    
    this.initialized = false;
    this.fallbackActive = false;
    this.lastSerenaCheck = 0;
    this.consecutiveFailures = 0;
    this.maxFailures = options.maxFailures || 3;
    this._recoveryCheckerRunning = false;
    this._recoveryTimer = null;
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalCalls: 0,
      serenaCalls: 0,
      fallbackCalls: 0,
      fallbackActivations: 0,
      autoRecoveries: 0
    };
    
    this.onFallbackActivate = options.onFallbackActivate || (() => {});
    this.onFallbackRecover = options.onFallbackRecover || (() => {});
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.projectRoot) this.projectRoot = config.projectRoot;
      if (config.maxFiles) this.maxFiles = config.maxFiles;
      if (config.maxFailures) this.maxFailures = config.maxFailures;
      if (config.autoRecovery !== undefined) this.autoRecovery = config.autoRecovery;
      if (config.recoveryCheckInterval) this.recoveryCheckInterval = config.recoveryCheckInterval;
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[SerenaFallback] Initialized (project: ' + this.projectRoot + ')');
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
        status: this.fallbackActive ? 'degraded' : 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        fallbackActive: this.fallbackActive,
        consecutiveFailures: this.consecutiveFailures
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
  
  async callWithFallback(serenaFn, fallbackFn, context) {
    this.metrics.totalCalls++;
    
    if (this.fallbackActive) {
      this.metrics.fallbackCalls++;
      console.log('[SerenaFallback] ' + context + ': Using fallback');
      return await fallbackFn();
    }
    
    try {
      this.metrics.serenaCalls++;
      const result = await serenaFn();
      this.consecutiveFailures = 0;
      return result;
    } catch (error) {
      this.consecutiveFailures++;
      console.log('[SerenaFallback] ' + context + ': Serena failed (' + this.consecutiveFailures + '/' + this.maxFailures + ')');
      
      if (this.consecutiveFailures >= this.maxFailures) {
        this._activateFallback(context, error);
      }
      
      if (this.fallbackActive) {
        this.metrics.fallbackCalls++;
        return await fallbackFn();
      }
      
      throw error;
    }
  }
  
  _activateFallback(context, error) {
    this.fallbackActive = true;
    this.metrics.fallbackActivations++;
    
    const message = 'Serena fallback activated for ' + context + ': ' + error.message;
    console.warn('[SerenaFallback] WARNING: ' + message);
    
    this.onFallbackActivate({
      context,
      error: error.message,
      timestamp: Date.now(),
      consecutiveFailures: this.consecutiveFailures
    });
    
    if (this.autoRecovery) {
      this._startRecoveryChecker();
    }
  }
  
  _startRecoveryChecker() {
    if (this._recoveryCheckerRunning) return;
    
    this._recoveryCheckerRunning = true;
    
    this._recoveryTimer = setInterval(async () => {
      if (!this.fallbackActive) {
        clearInterval(this._recoveryTimer);
        this._recoveryCheckerRunning = false;
        return;
      }
      
      try {
        await this._serenaHealthCheck();
        this._recoverFromFallback();
        clearInterval(this._recoveryTimer);
        this._recoveryCheckerRunning = false;
      } catch (error) {
        console.log('[SerenaFallback] Recovery check failed, still in fallback mode');
      }
    }, this.recoveryCheckInterval);
    
    console.log('[SerenaFallback] Recovery checker started');
  }
  
  async _serenaHealthCheck() {
    const { execSync } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Serena health check timeout (5s)'));
      }, 5000);
      
      try {
        // Проверка доступности WSL
        execSync('wsl --list --verbose', { 
          encoding: 'utf8',
          timeout: 4000,
          stdio: 'pipe'
        });
        
        // Проверка Serena в WSL
        execSync('wsl -e bash -c "source $HOME/.local/bin/env && which serena"', {
          encoding: 'utf8',
          timeout: 4000,
          stdio: 'pipe'
        });
        
        clearTimeout(timeout);
        resolve({ healthy: true, source: 'wsl_serena_available' });
        
      } catch (error) {
        clearTimeout(timeout);
        resolve({ 
          healthy: false, 
          error: error.message,
          source: 'health_check_failed'
        });
      }
    });
  }
  
  _recoverFromFallback() {
    this.fallbackActive = false;
    this.consecutiveFailures = 0;
    this.metrics.autoRecoveries++;
    
    console.log('[SerenaFallback] Serena recovered, switching back to normal mode');
    
    this.onFallbackRecover({
      timestamp: Date.now(),
      wasInFallback: true,
      metrics: Object.assign({}, this.metrics)
    });
  }
  
  async findSymbolFallback(symbolName) {
    console.log('[SerenaFallback] find_symbol fallback for: ' + symbolName);
    
    const patterns = [
      'export const ' + symbolName,
      'export function ' + symbolName,
      'export class ' + symbolName,
      'const ' + symbolName + ' ='
    ];
    
    const results = [];
    
    try {
      const grepCmd = 'findstr /s /i /n "' + patterns[0] + '" *.ts *.tsx *.js *.jsx 2>nul';
      
      const output = execSync(grepCmd, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const lines = output.split('\n').slice(0, this.maxFiles);
      
      for (const line of lines) {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
          results.push({
            file: match[1],
            line: parseInt(match[2], 10),
            content: match[3].trim(),
            source: 'filesystem_grep'
          });
        }
      }
    } catch (error) {
      console.warn('[SerenaFallback] grep failed:', error.message);
    }
    
    return {
      symbols: results,
      fallback: true,
      count: results.length
    };
  }
  
  async searchPatternFallback(pattern) {
    console.log('[SerenaFallback] search_for_pattern fallback for: ' + pattern);
    
    const results = [];
    
    try {
      const grepCmd = 'findstr /s /i /n "' + pattern + '" *.ts *.tsx *.js *.jsx 2>nul';
      
      const output = execSync(grepCmd, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const lines = output.split('\n').slice(0, this.maxFiles);
      
      for (const line of lines) {
        const match = line.match(/^([^:]+):(\d+):(.*)$/);
        if (match) {
          results.push({
            file: match[1],
            line: parseInt(match[2], 10),
            content: match[3].trim(),
            source: 'filesystem_grep'
          });
        }
      }
    } catch (error) {
      console.warn('[SerenaFallback] grep failed:', error.message);
    }
    
    return {
      matches: results,
      fallback: true,
      count: results.length
    };
  }
  
  async getSymbolsOverviewFallback(filePath) {
    console.log('[SerenaFallback] get_symbols_overview fallback for: ' + filePath);
    
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const symbols = [];
      const exportRegex = /export\s+(const|function|class|interface|type)\s+(\w+)/g;
      let match;
      
      while ((match = exportRegex.exec(content)) !== null) {
        symbols.push({
          name: match[2],
          kind: match[1],
          line: content.substring(0, match.index).split('\n').length,
          source: 'filesystem_regex'
        });
      }
      
      return {
        file: filePath,
        symbols: symbols,
        fallback: true,
        count: symbols.length
      };
    } catch (error) {
      console.error('[SerenaFallback] Overview failed:', error.message);
      return {
        file: filePath,
        symbols: [],
        fallback: true,
        error: error.message
      };
    }
  }
  
  getStatus() {
    return {
      fallbackActive: this.fallbackActive,
      consecutiveFailures: this.consecutiveFailures,
      lastSerenaCheck: this.lastSerenaCheck,
      metrics: Object.assign({}, this.metrics),
      config: {
        maxFiles: this.maxFiles,
        maxFailures: this.maxFailures,
        autoRecovery: this.autoRecovery,
        recoveryCheckInterval: this.recoveryCheckInterval
      }
    };
  }
  
  forceFallback() {
    this.fallbackActive = true;
    this.metrics.fallbackActivations++;
    console.log('[SerenaFallback] Fallback forcibly activated');
  }
  
  forceRecovery() {
    this.fallbackActive = false;
    this.consecutiveFailures = 0;
    console.log('[SerenaFallback] Forcibly recovered');
  }
  
  resetMetrics() {
    this.metrics = {
      totalCalls: 0,
      serenaCalls: 0,
      fallbackCalls: 0,
      fallbackActivations: 0,
      autoRecoveries: 0
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      if (this._recoveryTimer) {
        clearInterval(this._recoveryTimer);
        this._recoveryTimer = null;
      }
      this._recoveryCheckerRunning = false;
      
      this.fallbackActive = false;
      this.consecutiveFailures = 0;
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[SerenaFallback] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[SerenaFallback] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = {
  SerenaFallbackManager
};
