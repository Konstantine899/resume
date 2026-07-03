/**
 * Memory Schema Versioning Plugin
 * Version: 1.0.0
 * 
 * @plugin memory-versioning
 * @version 1.0.0
 * @lifecycle init,health,migrate,shutdown
 * @dependencies memory-atomic, structured-logging
 */

const fs = require('fs');
const path = require('path');

class MemorySchemaManager {
  constructor(options = {}) {
    this.schemaVersion = options.schemaVersion || '1.0.0';
    this.migrationsPath = options.migrationsPath || '.opencode/context/migrations';
    this.memoryPath = options.memoryPath || '.opencode/context/project-memory.json';
    this.autoApply = options.autoApply !== false;
    
    this.initialized = false;
    this.migrations = [];
    
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      latency: 0
    };
    
    this.metrics = {
      totalMigrations: 0,
      appliedMigrations: 0,
      failedMigrations: 0,
      currentVersion: '0.0.0'
    };
  }
  
  async init(config = {}) {
    if (this.initialized) {
      return { status: 'already_initialized' };
    }
    
    const startTime = Date.now();
    
    try {
      if (config.schemaVersion) this.schemaVersion = config.schemaVersion;
      if (config.migrationsPath) this.migrationsPath = config.migrationsPath;
      if (config.memoryPath) this.memoryPath = config.memoryPath;
      if (config.autoApply !== undefined) this.autoApply = config.autoApply;
      
      this._ensureDirectory();
      this._loadMigrations();
      
      this.initialized = true;
      this.healthStatus = {
        status: 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentVersion: this._getCurrentVersion(),
        targetVersion: this.schemaVersion
      };
      
      console.log('[MemoryVersioning] Initialized (version: ' + this.schemaVersion + ')');
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
      const currentVersion = this._getCurrentVersion();
      const needsMigration = this._compareVersions(currentVersion, this.schemaVersion) < 0;
      
      this.healthStatus = {
        status: needsMigration ? 'degraded' : 'healthy',
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        currentVersion,
        targetVersion: this.schemaVersion,
        needsMigration,
        migrationsCount: this.migrations.length
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
    const dir = path.dirname(this.migrationsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  _loadMigrations() {
    try {
      if (fs.existsSync(this.migrationsPath)) {
        const files = fs.readdirSync(this.migrationsPath)
          .filter(f => f.endsWith('.js'))
          .sort();
        
        for (const file of files) {
          const migrationPath = path.join(this.migrationsPath, file);
          const migration = require(migrationPath);
          
          if (migration.up && migration.version) {
            this.migrations.push({
              version: migration.version,
              description: migration.description || '',
              up: migration.up,
              down: migration.down
            });
          }
        }
        
        console.log('[MemoryVersioning] Loaded ' + this.migrations.length + ' migrations');
      }
    } catch (error) {
      console.warn('[MemoryVersioning] Load migrations failed:', error.message);
    }
  }
  
  _getCurrentVersion() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const content = fs.readFileSync(this.memoryPath, 'utf8');
        const data = JSON.parse(content);
        return data.schemaVersion || '0.0.0';
      }
    } catch (error) {
      console.warn('[MemoryVersioning] Read version failed:', error.message);
    }
    return '0.0.0';
  }
  
  _setCurrentVersion(version) {
    try {
      let data = {};
      if (fs.existsSync(this.memoryPath)) {
        data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
      }
      data.schemaVersion = version;
      fs.writeFileSync(this.memoryPath, JSON.stringify(data, null, 2), 'utf8');
      this.metrics.currentVersion = version;
    } catch (error) {
      console.error('[MemoryVersioning] Set version failed:', error.message);
    }
  }
  
  needsMigration() {
    const currentVersion = this._getCurrentVersion();
    return this._compareVersions(currentVersion, this.schemaVersion) < 0;
  }
  
  _compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a !== b) return a - b;
    }
    return 0;
  }
  
  async migrate() {
    const currentVersion = this._getCurrentVersion();
    console.log('[MemoryVersioning] Current: ' + currentVersion + ', Target: ' + this.schemaVersion);
    
    if (!this.needsMigration()) {
      console.log('[MemoryVersioning] No migration needed');
      return { success: true, applied: 0 };
    }
    
    const pendingMigrations = this.migrations.filter(m =>
      this._compareVersions(currentVersion, m.version) < 0
    );
    
    console.log('[MemoryVersioning] Applying ' + pendingMigrations.length + ' migrations');
    
    for (const migration of pendingMigrations) {
      try {
        this.metrics.totalMigrations++;
        
        let data = {};
        if (fs.existsSync(this.memoryPath)) {
          data = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
        }
        
        const migratedData = await migration.up(data);
        migratedData.schemaVersion = migration.version;
        
        const tempPath = this.memoryPath + '.tmp.' + Date.now();
        fs.writeFileSync(tempPath, JSON.stringify(migratedData, null, 2), 'utf8');
        fs.renameSync(tempPath, this.memoryPath);
        
        this.metrics.appliedMigrations++;
        this.metrics.currentVersion = migration.version;
        
        console.log('[MemoryVersioning] Applied: ' + migration.version);
        
      } catch (error) {
        this.metrics.failedMigrations++;
        console.error('[MemoryVersioning] Migration failed:', migration.version, error.message);
        
        if (migration.down) {
          try {
            await migration.down({});
            console.log('[MemoryVersioning] Rolled back: ' + migration.version);
          } catch (rollbackError) {
            console.error('[MemoryVersioning] Rollback failed:', rollbackError.message);
          }
        }
        
        throw error;
      }
    }
    
    console.log('[MemoryVersioning] Complete. Applied: ' + this.metrics.appliedMigrations);
    
    return {
      success: true,
      applied: this.metrics.appliedMigrations,
      failed: this.metrics.failedMigrations,
      currentVersion: this.metrics.currentVersion
    };
  }
  
  createMigrationTemplate(version, description) {
    const template = '/**\n * Migration: ' + version + '\n */\n\nmodule.exports = {\n  version: \'' + version + '\',\n  description: \'' + description + '\',\n  async up(data) { return data; },\n  async down(data) { return data; }\n};\n';
    
    const filename = version.replace(/\./g, '-') + '.js';
    const filePath = path.join(this.migrationsPath, filename);
    
    fs.writeFileSync(filePath, template, 'utf8');
    console.log('[MemoryVersioning] Template: ' + filePath);
    
    return filePath;
  }
  
  getStatus() {
    return {
      currentVersion: this._getCurrentVersion(),
      targetVersion: this.schemaVersion,
      needsMigration: this.needsMigration(),
      migrationsCount: this.migrations.length,
      metrics: Object.assign({}, this.metrics),
      migrations: this.migrations.map(m => ({ version: m.version, description: m.description }))
    };
  }
  
  resetMetrics() {
    this.metrics = {
      totalMigrations: 0,
      appliedMigrations: 0,
      failedMigrations: 0,
      currentVersion: '0.0.0'
    };
  }
  
  async shutdown() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    try {
      const startTime = Date.now();
      
      this.migrations = [];
      this.initialized = false;
      
      this.healthStatus = {
        status: 'shutting_down',
        lastCheck: Date.now(),
        latency: Date.now() - startTime
      };
      
      console.log('[MemoryVersioning] Shutdown complete');
      return { status: 'shutdown_complete', latency: Date.now() - startTime };
      
    } catch (error) {
      console.error('[MemoryVersioning] Shutdown failed:', error.message);
      return { status: 'shutdown_failed', error: error.message };
    }
  }
}

module.exports = { MemorySchemaManager };
