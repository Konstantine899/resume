# Agent Integration Plan — Агенты + Плагины + MCP + LSP

**Дата создания:** 2026-07-03  
**Версия:** 1.0.0  
**Статус:** Approved  
**Приоритет:** High

---

## 🎯 Цель

Создать единую интегрированную систему где:
- **Агенты (16)** используют **плагины (14)** для enhanced capabilities
- **MCP серверы (7)** защищены **circuit-breaker** и **guard-tiered-security**
- **LSP** предоставляет семантический контекст агентам
- **Плагины** добавляют reliability, monitoring, optimization

---

## 📊 Текущее Состояние

### ✅ Что Уже Работает

| Компонент | Количество | Статус | Интеграция |
|-----------|------------|--------|------------|
| **Агенты** | 16 | ✅ Active | Через orchestrator |
| **MCP Серверы** | 7 | ✅ Active | С circuit-breaker |
| **Плагины** | 14 | ✅ С lifecycle | Автономные |
| **LSP** | 1 (TS) | ✅ Enabled | typescript-language-server |
| **Registry** | 1 | ✅ Валиден | 16 агентов, 14 плагинов |

### ❌ Чего Не Хватает

| Проблема | Влияние | Приоритет |
|----------|---------|-----------|
| Агенты не используют плагины напрямую | Нет metrics, logging, caching | **High** |
| MCP вызовы без guard tiers | Security риски | **High** |
| LSP диагностика не передаётся агентам | Меньше контекста | **Medium** |
| Нет unified health dashboard | Сложно мониторить | **Medium** |
| Плагины не знают о контексте агентов | Нет adaptive behavior | **Low** |

---

## 🔧 План Интеграции

### **Фаза 1: Агенты + Плагины (High Priority)**

#### 1.1 Structured Logging для Всех Агентов

**Задача:** Каждый агент логирует действия через `structured-logging.js`

**Реализация:**
```javascript
// В orchestrator.md добавить instruction:
const { getLogger } = require('../plugins/structured-logging.js');
const logger = getLogger();

logger.startTrace('orchestrator');
logger.startSpan('decompose-task', 'memory');
// ... выполнение ...
logger.endSpan('decompose-task', duration, 'success');
logger.endTrace('success');
```

**Результат:**
- ✅ Unified logging для всех агентов
- ✅ Trace ID для корреляции событий
- ✅ Sampling для DEBUG логов

**Объём:** 2 часа

---

#### 1.2 Agent Metrics для Всех Агентов

**Задача:** Сбор метрик производительности агентов

**Реализация:**
```javascript
// В каждый агент добавить:
const { getCollector } = require('../plugins/agent-metrics.js');
const metrics = getCollector();

// Перед выполнением:
const startTime = Date.now();

// После выполнения:
metrics.record('agent_call', 'orchestrator', Date.now() - startTime, {
  status: 'success',
  task: 'decompose'
});
```

**Результат:**
- ✅ p50/p95/p99 latency для каждого агента
- ✅ Error rate tracking
- ✅ Dashboard с метриками

**Объём:** 3 часа

---

#### 1.3 Guard Tiers для MCP Вызовов

**Задача:** Все MCP вызовы проходят через guard-tiered-security

**Реализация:**
```javascript
// В orchestrator.md добавить:
const { GuardTieredSecurity } = require('../plugins/guard-tiered-security.js');
const guard = new GuardTieredSecurity();

// Перед MCP вызовом:
const decision = await guard.check('filesystem:write', 'src/components/Button.tsx', {
  agent: 'ui',
  context: 'Creating new component'
});

if (!decision.approved) {
  throw new SecurityError(decision.reason);
}
```

**Результат:**
- ✅ Premoderation для高风险 операций
- ✅ Postmoderation для средних
- ✅ Sampling для низких

**Объём:** 4 часа

---

#### 1.4 Circuit Breaker для MCP

**Задача:** Защита от cascade failures при отказе MCP серверов

**Реализация:**
```javascript
// Уже настроено в opencode.json:
"mcp": {
  "circuitBreaker": {
    "enabled": true,
    "threshold": 3,
    "resetTimeout": 60000
  }
}
```

**Дополнить:** Интеграция с serena-fallback

```javascript
const { MCPCircuitManager } = require('../plugins/circuit-breaker.js');
const { SerenaFallbackManager } = require('../plugins/serena-fallback.js');

const circuitManager = new MCPCircuitManager();
const fallback = new SerenaFallbackManager();

// Вызов с fallback:
await fallback.callWithFallback(
  () => circuitManager.call('serena', serenaFn, 'find_symbol'),
  () => fallback.findSymbolFallback('ComponentName'),
  'find_symbol'
);
```

**Результат:**
- ✅ Автоматический fallback при отказе Serena
- ✅ Auto-recovery когда Serena восстанавливается

**Объём:** 2 часа

---

### **Фаза 2: MCP + LSP Интеграция (Medium Priority)**

#### 2.1 LSP Diagnostics для Агентов

**Задача:** Агенты получают диагностику от LSP серверов

**Реализация:**
```javascript
// Создать plugin: lsp-diagnostics.js
class LSPDiagnostics {
  async getDiagnostics(filePath) {
    // Запрос к typescript-language-server
    // Возврат ошибок типов, linting issues
  }
  
  async fixDiagnostics(agent, filePath) {
    // Авто-исправление через agent
  }
}
```

**Интеграция с агентами:**
```javascript
// В ui агенте:
const diagnostics = await lsp.getDiagnostics('src/components/Button.tsx');
if (diagnostics.length > 0) {
  // Исправить перед завершением
  await lsp.fixDiagnostics('ui', 'src/components/Button.tsx');
}
```

**Результат:**
- ✅ Агенты создают код без ошибок типов
- ✅ Автоматическое исправление linting issues

**Объём:** 6 часов

---

#### 2.2 Serena + LSP Synergy

**Задача:** Serena использует LSP для семантических операций

**Текущая конфигурация:**
```json
"serena": {
  "type": "wsl",
  "command": "wsl --exec bash -c 'serena start-mcp-server --context claude-code --project /mnt/d/Dev/projects/resume'",
  "fallback": {
    "enabled": true,
    "strategy": "filesystem_grep"
  }
}
```

**Улучшение:** Добавить LSP context
```json
"serena": {
  "type": "wsl",
  "command": "wsl --exec bash -c 'serena start-mcp-server --context opencode --project /mnt/d/Dev/projects/resume --lsp-enabled'",
  "lspIntegration": {
    "enabled": true,
    "servers": ["typescript-language-server", "eslint"]
  }
}
```

**Результат:**
- ✅ Serena использует LSP для точной навигации
- ✅ Меньше токенов (семантический контекст)

**Объём:** 4 часа

---

### **Фаза 3: Unified Health Dashboard (Medium Priority)**

#### 3.1 Health Aggregation Plugin

**Задача:** Единый endpoint для проверки здоровья всей системы

**Реализация:**
```javascript
// plugins/health-dashboard.js
class HealthDashboard {
  async checkAll() {
    const plugins = await Promise.all([
      structuredLogging.health(),
      circuitBreaker.health(),
      agentMetrics.health(),
      // ... все плагины
    ]);
    
    const mcpServers = await Promise.all([
      this.checkMCPServer('filesystem'),
      this.checkMCPServer('serena'),
      // ... все MCP
    ]);
    
    const agents = await Promise.all([
      this.checkAgent('orchestrator'),
      this.checkAgent('guard'),
      // ... все агенты
    ]);
    
    return {
      overall: this.calculateOverall(plugins, mcpServers, agents),
      plugins,
      mcpServers,
      agents,
      timestamp: Date.now()
    };
  }
}
```

**API:**
```bash
# Через CLI
opencode health

# Через MCP
mcp call health-dashboard:checkAll
```

**Результат:**
```json
{
  "overall": "healthy",
  "plugins": {
    "structured-logging": { "status": "healthy", "latency": 5 },
    "circuit-breaker": { "status": "healthy", "circuitState": "CLOSED" }
  },
  "mcpServers": {
    "serena": { "status": "healthy", "latency": 35 }
  },
  "agents": {
    "orchestrator": { "status": "healthy" }
  }
}
```

**Объём:** 8 часов

---

#### 3.2 Alerts Integration

**Задача:** Уведомления о проблемах

**Реализация:**
```javascript
// В agent-metrics.js добавить:
const alertRules = [
  {
    name: 'HighAgentLatency',
    condition: 'agent:p99_latency_ms > 30000',
    severity: 'warning',
    channels: ['console', 'log', 'file']
  },
  {
    name: 'MCPCircuitOpen',
    condition: 'mcp:circuit_state == "OPEN"',
    severity: 'critical',
    channels: ['console', 'log', 'file', 'alert']
  }
];

// Проверка при каждой метрике:
this.checkAlerts(metrics);
```

**Результат:**
- ✅ Alerts в console
- ✅ Alerts в лог файл
- ✅ Alerts в отдельный файл алертов

**Объём:** 4 часа

---

### **Фаза 4: Adaptive Plugins (Low Priority)**

#### 4.1 Context-Aware Plugins

**Задача:** Плагины адаптируются под контекст агента

**Реализация:**
```javascript
// В structured-logging.js:
async init(config) {
  this.currentAgent = config.agent || 'unknown';
  this.currentTask = config.task || 'unknown';
  
  // Разный уровень логирования для разных агентов
  if (this.currentAgent === 'guard') {
    this.logLevel = 'DEBUG';  // Guard логирует всё
  } else if (this.currentAgent === 'performance-test') {
    this.logLevel = 'INFO';
  }
}
```

**Результат:**
- ✅ Guard логирует детальнее
- ✅ Performance-test меньше логирует
- ✅ Экономия токенов

**Объём:** 3 часа

---

#### 4.2 Plugin Chaining

**Задача:** Плагины вызывают другие плагины

**Реализация:**
```javascript
// В guard-tiered-security.js:
async check(operation, path, context) {
  // Логирование через structured-logging
  const logger = getLogger();
  logger.info('Guard check', { operation, path, agent: context.agent });
  
  // Метрики через agent-metrics
  const metrics = getCollector();
  metrics.record('guard_check', operation, duration, { decision: 'approved' });
  
  // ... остальная логика
}
```

**Результат:**
- ✅ Автоматическое логирование guard действий
- ✅ Автоматические метрики
- ✅ Меньше boilerplate кода

**Объём:** 4 часа

---

## 📅 Roadmap

| Фаза | Задачи | Объём | Приоритет | Срок |
|------|--------|-------|-----------|------|
| **Фаза 1** | Агенты + Плагины | 11 часов | **High** | Неделя 1 |
| **Фаза 2** | MCP + LSP | 10 часов | **Medium** | Неделя 2 |
| **Фаза 3** | Health Dashboard | 12 часов | **Medium** | Неделя 3 |
| **Фаза 4** | Adaptive Plugins | 7 часов | **Low** | Неделя 4 |

**Итого:** 40 часов (5 рабочих дней)

---

## 🎯 Рекомендуемый Порядок Работ

### Неделя 1 (High Priority)

| День | Задача | Объём | Статус |
|------|--------|-------|--------|
| 1 | Structured Logging для всех агентов | 2ч | ⏳ Pending |
| 2 | Agent Metrics для всех агентов | 3ч | ⏳ Pending |
| 3 | Guard Tiers для MCP | 4ч | ⏳ Pending |
| 4 | Circuit Breaker + Serena Fallback | 2ч | ⏳ Pending |

**Результат недели:** Все агенты логируют действия и собирают метрики, MCP защищены guard и circuit-breaker.

---

### Неделя 2 (Medium Priority)

| День | Задача | Объём | Статус |
|------|--------|-------|--------|
| 1 | LSP Diagnostics plugin | 3ч | ⏳ Pending |
| 2 | Интеграция LSP с ui агентом | 3ч | ⏳ Pending |
| 3 | Serena + LSP Synergy | 4ч | ⏳ Pending |

**Результат недели:** Агенты получают LSP диагностику, Serena использует LSP для навигации.

---

### Неделя 3 (Medium Priority)

| День | Задача | Объём | Статус |
|------|--------|-------|--------|
| 1-2 | Health Dashboard plugin | 8ч | ⏳ Pending |
| 3 | Alerts Integration | 4ч | ⏳ Pending |

**Результат недели:** Unified health dashboard с alerts.

---

### Неделя 4 (Low Priority)

| День | Задача | Объём | Статус |
|------|--------|-------|--------|
| 1 | Context-Aware Plugins | 3ч | ⏳ Pending |
| 2 | Plugin Chaining | 4ч | ⏳ Pending |

**Результат недели:** Адаптивные плагины с chaining.

---

## ✅ Критерии Успеха

| Метрика | Базовый Уровень | Целевой Уровень | Статус |
|---------|-----------------|-----------------|--------|
| **Агенты с logging** | 0/16 | 16/16 | ⏳ Pending |
| **Агенты с metrics** | 0/16 | 16/16 | ⏳ Pending |
| **MCP с guard** | 0/7 | 7/7 | ⏳ Pending |
| **MCP с circuit-breaker** | 1/7 | 7/7 | ⏳ Pending |
| **LSP diagnostics** | Нет | Есть | ⏳ Pending |
| **Health dashboard** | Нет | Есть | ⏳ Pending |
| **Alerts** | Нет | Есть | ⏳ Pending |

---

## 📁 Зависимости

### Файлы для Изменения

| Файл | Изменения | Фаза |
|------|-----------|------|
| `.opencode/agents/orchestrator.md` | Добавить logging, metrics, guard | 1 |
| `.opencode/agents/ui.md` | Добавить logging, metrics, LSP | 1, 2 |
| `.opencode/agents/review.md` | Добавить logging, metrics | 1 |
| `.opencode/agents/test-generation.md` | Добавить logging, metrics | 1 |
| `.opencode/agents/guard.md` | Добавить logging, metrics | 1 |
| `.opencode/plugins/lsp-diagnostics.js` | Создать новый | 2 |
| `.opencode/plugins/health-dashboard.js` | Создать новый | 3 |
| `.opencode/opencode.json` | Обновить конфигурацию | 2 |

### Новые Файлы

| Файл | Назначение | Фаза |
|------|------------|------|
| `.opencode/plugins/lsp-diagnostics.js` | LSP diagnostics для агентов | 2 |
| `.opencode/plugins/health-dashboard.js` | Unified health monitoring | 3 |
| `.opencode/plugins/alerts.js` | Alerts integration | 3 |

---

## 🚀 Риски и Митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| **Агенты игнорируют плагины** | Средняя | Высокое | Добавить в инструкции агентов, тесты |
| **LSP рассинхронизация** | Средняя | Среднее | Fallback на filesystem grep |
| **Performance degradation** | Низкая | Высокое | Metrics monitoring, adaptive plugins |
| **Plugin circular dependencies** | Низкая | Среднее | Dependency graph validation |
| **Memory leaks** | Средняя | Среднее | Lifecycle interface, тесты |

---

## 📊 Метрики Прогресса

### Phase 1: Агенты + Плагины

- [ ] Structured Logging: 0/16 агентов
- [ ] Agent Metrics: 0/16 агентов
- [ ] Guard Tiers: 0/7 MCP
- [ ] Circuit Breaker: 1/7 MCP → 7/7 MCP

### Phase 2: MCP + LSP

- [ ] LSP Diagnostics plugin: 0/1
- [ ] Интеграция с агентами: 0/5
- [ ] Serena + LSP: 0/1

### Phase 3: Health Dashboard

- [ ] Health Dashboard plugin: 0/1
- [ ] Alerts Integration: 0/1

### Phase 4: Adaptive Plugins

- [ ] Context-Aware Plugins: 0/14
- [ ] Plugin Chaining: 0/14

---

## 🔗 Связанные Документы

- [[registry.json]] — Component Registry
- [[PHASE1-COMPLETE]] — Phase 1 завершение
- [[PHASE2-COMPLETE]] — Phase 2 завершение
- [[PHASE-TESTING-COMPLETE]] — Тестирование
- [[FINAL-STATUS]] — Финальный статус
- [[AGENTS.md]] — Инструкции агентов
- [[opencode.json]] — Конфигурация

---

## 📝 История Изменений

| Версия | Дата | Изменения | Автор |
|--------|------|-----------|-------|
| 1.0.0 | 2026-07-03 | Initial version | AI Architect |

---

**Статус:** Approved ✅  
**Следующий шаг:** Начать Phase 1, Задача 1.1 (Structured Logging для агентов)
