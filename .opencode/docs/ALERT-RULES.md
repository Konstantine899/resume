# 🚨 Alert Rules Configuration

**Версия:** 1.0.0  
**Дата:** 2026-07-03

---

## 📊 Обзор

Alert rules настроены в `opencode.json` секции `metrics.alerts`.

---

## 📋 Существующие правила

| Name | Condition | Severity | Каналы |
|------|-----------|----------|--------|
| HighAgentLatency | agent:p99_latency_ms > 30000 | warning | console, log |
| MCPCircuitOpen | mcp:circuit_state == 'OPEN' | critical | console, log |
| LowCacheHitRate | cache:hit_rate < 0.5 | info | log |
| HighErrorRate | system:error_rate > 5 | warning | console, log |
| PipelineSlow | pipeline:p95_duration_ms > 120000 | warning | console, log |

---

## 🔧 Добавление новых правил

```json
{
  "name": "CustomAlert",
  "condition": "metric:path > threshold",
  "severity": "warning"
}
```

**Severity levels:**
- `info` — Информационные
- `warning` — Предупреждения
- `critical` — Критические

---

## 📎 Связанные документы

- [[agent-metrics]] — Agent Metrics Dashboard
- [[structured-logging]] — Structured Logging

---

**Обновлено:** 2026-07-03
