# OpenCode Troubleshooting Guide

> **Проект:** Resume Portfolio  
> **Версия:** 1.0.0  
> **Дата:** 2026-06-14  
> **Статус:** ✅ Active

---

## 📋 Содержание

1. [Диагностика проблем](#диагностика-проблем)
2. [Проблемы запуска](#проблемы-запуска)
3. [Проблемы с моделями](#проблемы-с-моделями)
4. [Проблемы с MCP серверами](#проблемы-mcp-серверами)
5. [Проблемы с агентами](#проблемы-с-агентами)
6. [Проблемы с конфигурацией](#проблемы-с-конфигурацией)
7. [Проблемы с Quality Gates](#проблемы-с-quality-gates)
8. [Проблемы с пайплайнами](#проблемы-с-пайплайнами)
9. [Проблемы с безопасностью](#проблемы-с-безопасностью)
10. [Восстановление конфигурации](#восстановление-конфигурации)
11. [Полезные скрипты](#полезные-скрипты)

---

## Диагностика проблем

### Шаг 1: Проверка базовых требований

```powershell
# Проверка Node.js
node --version
# Ожидается: v18+ или v20+

# Проверка npm
npm --version
# Ожидается: 9+

# Проверка Ollama
ollama --version
# Ожидается: 0.1.x+

# Проверка моделей Ollama
ollama list
# Ожидаются: qwen2.5-coder:7b-instruct-q4_K_M, deepseek-coder:1.3b-instruct-q4_K_M
```

### Шаг 2: Проверка структуры проекта

```powershell
# Проверка директории .opencode
Test-Path .opencode

# Проверка конфига
Test-Path .opencode\opencode.json

# Проверка агентов
Get-ChildItem .opencode\agents\*.md

# Проверка конфигов
Get-ChildItem .opencode\config\*.jsonc
```

### Шаг 3: Проверка логов

```powershell
# Логи Guard
if (Test-Path .opencode\logs\guard-audit.log) {
  Get-Content .opencode\logs\guard-audit.log -Tail 50
}

# Логи Quality Gates
if (Test-Path .opencode\logs\quality-gates.log) {
  Get-Content .opencode\logs\quality-gates.log -Tail 50
}

# Логи пайплайнов
if (Test-Path .opencode\logs\pipelines.log) {
  Get-Content .opencode\logs\pipelines.log -Tail 50
}
```

### Шаг 4: Валидация JSON

```powershell
# Валидация opencode.json
try {
  $json = Get-Content .opencode\opencode.json -Raw
  $json | ConvertFrom-Json
  Write-Host "✅ opencode.json валиден" -ForegroundColor Green
} catch {
  Write-Host "❌ Ошибка в opencode.json: $($_.Exception.Message)" -ForegroundColor Red
}

# Валидация quality-gates.jsonc
try {
  $jsonc = Get-Content .opencode\config\quality-gates.jsonc -Raw
  # Удаление комментариев JSONC
  $json = $jsonc -replace '/\*[\s\S]*?\*/', '' -replace '//.*', ''
  $json | ConvertFrom-Json
  Write-Host "✅ quality-gates.jsonc валиден" -ForegroundColor Green
} catch {
  Write-Host "❌ Ошибка в quality-gates.jsonc: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## Проблемы запуска

### Проблема: OpenCode не запускается

**Симптомы:**
- Приложение закрывается сразу после запуска
- Ошибки при инициализации
- Бесконечная загрузка

**Решения:**

#### 1. Проверка Ollama

```powershell
# Проверка службы Ollama
ollama list

# Если пусто - скачайте модели
ollama pull qwen2.5-coder:7b-instruct-q4_K_M
ollama pull deepseek-coder:1.3b-instruct-q4_K_M

# Проверка работы Ollama API
curl http://localhost:11434/api/tags
```

#### 2. Проверка конфигурации

```powershell
# Копирование бэкапа
Copy-Item .opencode\opencode.json.bak .opencode\opencode.json.override

# Редактирование opencode.json.override
# Проверка путей к моделям
```

#### 3. Проверка прав доступа

```powershell
# Проверка прав на запись в .opencode
try {
  Add-Content .opencode\logs\test-permission.txt "test $(Get-Date)"
  Write-Host "✅ Права на запись есть" -ForegroundColor Green
  Remove-Item .opencode\logs\test-permission.txt
} catch {
  Write-Host "❌ Нет прав на запись: $($_.Exception.Message)" -ForegroundColor Red
}
```

#### 4. Перезапуск OpenCode

```powershell
# Завершение процессов OpenCode
Get-Process | Where-Object { $_.ProcessName -like "*opencode*" } | Stop-Process -Force

# Очистка кэша
Remove-Item -Path "$env:LOCALAPPDATA\opencode\Cache" -Recurse -Force -ErrorAction SilentlyContinue

# Запуск OpenCode
Start-Process "C:\Program Files\OpenCode\OpenCode.exe"
```

---

## Проблемы с моделями

### Проблема: Модели не загружаются

**Симптомы:**
- Ошибки при загрузке моделей
- Таймауты подключения
- Модели не отображаются в списке

**Решения:**

#### 1. Проверка доступности Ollama

```powershell
# Проверка сервиса
Test-NetConnection -ComputerName localhost -Port 11434

# Проверка API
Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
```

#### 2. Переустановка моделей

```powershell
# Удаление моделей
ollama rm qwen2.5-coder:7b-instruct-q4_K_M
ollama rm deepseek-coder:1.3b-instruct-q4_K_M

# Скачивание заново
ollama pull qwen2.5-coder:7b-instruct-q4_K_M
ollama pull deepseek-coder:1.3b-instruct-q4_K_M

# Проверка
ollama list
```

#### 3. Проверка дискового пространства

```powershell
# Проверка свободного места
Get-Volume | Where-Object { $_.DriveLetter -eq 'C' } | Select-Object SizeRemaining, Size

# Модели занимают ~5GB для qwen2.5-coder:7b и ~1GB для deepseek-coder:1.3b
```

#### 4. Альтернативные модели

Если проблемы с конкретными моделями, используйте альтернативы:

```json
{
  "model": "ollama/qwen2.5-coder:7b",
  "small_model": "ollama/deepseek-coder:1.3b"
}
```

---

## Проблемы с MCP серверами

### Проблема: MCP серверы не подключаются

**Симптомы:**
- Ошибки инициализации MCP
- Таймауты подключения
- Серверы не отображаются в списке

**Решения:**

#### 1. Проверка интернет-соединения

```powershell
# Проверка подключения
Test-Connection google.com -Count 2

# Проверка доступа к npm registry
Invoke-RestMethod -Uri "https://registry.npmjs.org" -Method Head
```

#### 2. Очистка npm кэша

```powershell
# Очистка кэша
npm cache clean --force

# Проверка кэша
npm cache verify
```

#### 3. Переустановка MCP пакетов

```powershell
# Удаление node_modules
Remove-Item -Path .opencode\node_modules -Recurse -Force

# Удаление package-lock.json
Remove-Item -Path .opencode\package-lock.json -Force

# Переустановка
npm install --prefix .opencode

# Проверка установки
Get-ChildItem .opencode\node_modules\@modelcontextprotocol
```

#### 4. Ручная проверка MCP

```powershell
# Проверка filesystem MCP
npx -y @modelcontextprotocol/server-filesystem --help

# Проверка memory MCP
npx -y @modelcontextprotocol/server-memory --help

# Проверка eslint MCP
npx -y @eslint/mcp --help

# Проверка playwright MCP
npx -y @playwright/mcp --help
```

#### 5. Проверка переменных окружения

```powershell
# Проверка CONTEXT7_API_KEY
if ($env:CONTEXT7_API_KEY) {
  Write-Host "✅ CONTEXT7_API_KEY установлен" -ForegroundColor Green
} else {
  Write-Host "❌ CONTEXT7_API_KEY не установлен" -ForegroundColor Red
  Write-Host "Создайте файл .env в корне проекта:" -ForegroundColor Yellow
  Write-Host "CONTEXT7_API_KEY=your-api-key-here" -ForegroundColor Yellow
}
```

---

## Проблемы с агентами

### Проблема: Агенты не отвечают

**Симптомы:**
- Агенты не реагируют на команды
- Таймауты при выполнении
- Пустые ответы

**Решения:**

#### 1. Проверка файлов агентов

```powershell
# Проверка наличия файлов
$agents = @('review', 'guard', 'orchestrator', 'integration-test')
foreach ($agent in $agents) {
  if (Test-Path ".opencode\agents\$agent.md") {
    Write-Host "✅ $agent.md существует" -ForegroundColor Green
  } else {
    Write-Host "❌ $agent.md отсутствует" -ForegroundColor Red
  }
}
```

#### 2. Проверка инструкций

```powershell
# Проверка пути к инструкциям в opencode.json
$json = Get-Content .opencode\opencode.json -Raw | ConvertFrom-Json
$instructions = $json.instructions

foreach ($instruction in $instructions) {
  if (Test-Path $instruction) {
    Write-Host "✅ $instruction существует" -ForegroundColor Green
  } else {
    Write-Host "❌ $instruction отсутствует" -ForegroundColor Red
  }
}
```

#### 3. Проверка контекста

```powershell
# Очистка контекста (если проблемы)
if (Test-Path .opencode\context\context-store.json) {
  Copy-Item .opencode\context\context-store.json .opencode\context\context-store.json.backup
  Remove-Item .opencode\context\context-store.json -Force
  Write-Host "✅ Контекст очищен" -ForegroundColor Green
}

# Проверка project-memory
if (Test-Path .opencode\context\project-memory.json) {
  Write-Host "✅ project-memory.json существует" -ForegroundColor Green
} else {
  Write-Host "⚠️ project-memory.json отсутствует (будет создан)" -ForegroundColor Yellow
}
```

---

## Проблемы с конфигурацией

### Проблема: Ошибки в конфигурации

**Симптомы:**
- OpenCode не читает конфиг
- Ошибки парсинга JSON
- Не применяются настройки

**Решения:**

#### 1. Валидация opencode.json

```powershell
# Полная валидация
try {
  $json = Get-Content .opencode\opencode.json -Raw
  $parsed = $json | ConvertFrom-Json
  
  # Проверка обязательных полей
  $required = @('model', 'small_model', 'mcp', 'guard')
  foreach ($field in $required) {
    if ($parsed.$field) {
      Write-Host "✅ Поле '$field' присутствует" -ForegroundColor Green
    } else {
      Write-Host "❌ Поле '$field' отсутствует" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "❌ Ошибка парсинга: $($_.Exception.Message)" -ForegroundColor Red
}
```

#### 2. Восстановление из бэкапа

```powershell
# Проверка бэкапов
if (Test-Path .opencode\opencode.json.bak) {
  Write-Host "✅ Бэкап найден" -ForegroundColor Green
  
  # Сравнение с бэкапом
  $current = Get-Content .opencode\opencode.json -Raw
  $backup = Get-Content .opencode\opencode.json.bak -Raw
  
  if ($current -eq $backup) {
    Write-Host "✅ Конфиг совпадает с бэкапом" -ForegroundColor Green
  } else {
    Write-Host "⚠️ Конфиг отличается от бэкапа" -ForegroundColor Yellow
  }
} else {
  Write-Host "❌ Бэкап не найден" -ForegroundColor Red
}
```

#### 3. Исправление распространённых ошибок

**Ошибка: Неправильные пути к инструкциям**

```json
// ❌ НЕПРАВИЛЬНО
"instructions": [".opencode/AGENTS.md"]

// ✅ ПРАВИЛЬНО
"instructions": [".opencode/docs/AGENTS.md"]
```

**Ошибка: Неправильный формат MCP**

```json
// ❌ НЕПРАВИЛЬНО
"mcp": {
  "filesystem": {
    "command": "npx @modelcontextprotocol/server-filesystem"
  }
}

// ✅ ПРАВИЛЬНО
"mcp": {
  "filesystem": {
    "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"],
    "args": ["D:/Dev/projects", "D:/Dev/tools"]
  }
}
```

---

## Проблемы с Quality Gates

### Проблема: Quality Gates не работают

**Симптомы:**
- Проверки не выполняются
- Ошибки валидации
- Агенты не запускаются

**Решения:**

#### 1. Проверка конфигурации Quality Gates

```powershell
# Валидация quality-gates.jsonc
try {
  $jsonc = Get-Content .opencode\config\quality-gates.jsonc -Raw
  $json = $jsonc -replace '/\*[\s\S]*?\*/', '' -replace '//.*', ''
  $parsed = $json | ConvertFrom-Json
  
  # Проверка gates
  $gates = @('pre-commit', 'pre-merge', 'pre-deploy')
  foreach ($gate in $gates) {
    if ($parsed.gates.$gate) {
      Write-Host "✅ Gate '$gate' настроен" -ForegroundColor Green
    } else {
      Write-Host "❌ Gate '$gate' отсутствует" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "❌ Ошибка парсинга: $($_.Exception.Message)" -ForegroundColor Red
}
```

#### 2. Проверка агентов для Quality Gates

```powershell
# Агенты required для Quality Gates
$requiredAgents = @('review')

foreach ($agent in $requiredAgents) {
  if (Test-Path ".opencode\agents\$agent.md") {
    Write-Host "✅ Агент '$agent' существует" -ForegroundColor Green
  } else {
    Write-Host "❌ Агент '$agent' отсутствует" -ForegroundColor Red
  }
}
```

#### 3. Отладка Quality Gates

```powershell
# Включение debug логирования
$json = Get-Content .opencode\config\quality-gates.jsonc -Raw
$json = $json -replace '"logLevel":\s*"[^"]*"', '"logLevel": "DEBUG"'
Set-Content .opencode\config\quality-gates.jsonc -Value $json

# Проверка логов
Get-Content .opencode\logs\quality-gates.log -Tail 100 -Wait
```

---

## Проблемы с пайплайнами

### Проблема: Пайплайны не выполняются

**Симптомы:**
- Пайплайны прерываются
- Шаги не выполняются
- Ошибки агрегации

**Решения:**

#### 1. Проверка конфигурации пайплайнов

```powershell
# Валидация pipelines.jsonc
try {
  $jsonc = Get-Content .opencode\config\pipelines.jsonc -Raw
  $json = $jsonc -replace '/\*[\s\S]*?\*/', '' -replace '//.*', ''
  $parsed = $json | ConvertFrom-Json
  
  # Проверка пайплайнов
  $pipelines = @('create-component', 'code-review', 'fix-bug', 'refactor', 'integration-test')
  foreach ($pipeline in $pipelines) {
    if ($parsed.pipelines.$pipeline) {
      Write-Host "✅ Пайплайн '$pipeline' настроен" -ForegroundColor Green
    } else {
      Write-Host "❌ Пайплайн '$pipeline' отсутствует" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "❌ Ошибка парсинга: $($_.Exception.Message)" -ForegroundColor Red
}
```

#### 2. Проверка шагов пайплайна

```powershell
# Проверка шагов для create-component
$pipeline = $parsed.pipelines.'create-component'
Write-Host "Пайплайн: create-component"
Write-Host "Количество шагов: $($pipeline.steps.Count)"

foreach ($step in $pipeline.steps) {
  Write-Host "  Шаг $($step.id): $($step.agent) - $($step.task)"
}
```

#### 3. Отладка пайплайнов

```powershell
# Включение debug логирования
$json = Get-Content .opencode\config\pipelines.jsonc -Raw
$json = $json -replace '"logLevel":\s*"[^"]*"', '"logLevel": "DEBUG"'
Set-Content .opencode\config\pipelines.jsonc -Value $json

# Проверка логов
Get-Content .opencode\logs\pipelines.log -Tail 100 -Wait
```

---

## Проблемы с безопасностью

### Проблема: Guard блокирует действия

**Симптомы:**
- Действия блокируются без причины
- Частые запросы подтверждения
- Ошибки доступа

**Решения:**

#### 1. Проверка настроек Guard

```powershell
# Проверка конфига Guard
$json = Get-Content .opencode\opencode.json -Raw | ConvertFrom-Json

Write-Host "Guard настройки:"
Write-Host "  enabled: $($json.guard.enabled)"
Write-Host "  premoderation: $($json.guard.premoderation)"
Write-Host "  promptInjectionDetection: $($json.guard.promptInjectionDetection)"
Write-Host "  piiMasking: $($json.guard.piiMasking)"
Write-Host "  auditLogging: $($json.guard.auditLogging)"
```

#### 2. Проверка audit логов

```powershell
# Проверка логов Guard
if (Test-Path .opencode\logs\guard-audit.log) {
  Write-Host "Последние 50 записей guard-audit.log:"
  Get-Content .opencode\logs\guard-audit.log -Tail 50 | Format-Table
} else {
  Write-Host "⚠️ guard-audit.log не найден" -ForegroundColor Yellow
}
```

#### 3. Настройка исключений

Если Guard блокирует легитимные действия, добавьте исключения:

```json
{
  "guard": {
    "blockedPaths": [
      ".git/**",
      "node_modules/**",
      ".env*"
    ],
    "requireConfirmPaths": [
      ".opencode/config/*.jsonc",
      "opencode.json"
    ]
  }
}
```

---

## Восстановление конфигурации

### Полное восстановление

```powershell
# 1. Бэкап текущей конфигурации
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item .opencode\opencode.json ".opencode\opencode.json.backup-$timestamp"

# 2. Восстановление из бэкапа
Copy-Item .opencode\opencode.json.bak .opencode\opencode.json.override

# 3. Проверка валидности
try {
  Get-Content .opencode\opencode.json.override -Raw | ConvertFrom-Json
  Write-Host "✅ Конфигурация валидна" -ForegroundColor Green
} catch {
  Write-Host "❌ Конфигурация невалидна" -ForegroundColor Red
}

# 4. Перезапуск OpenCode
Get-Process | Where-Object { $_.ProcessName -like "*opencode*" } | Stop-Process -Force
Start-Process "C:\Program Files\OpenCode\OpenCode.exe"
```

### Сброс к настройкам по умолчанию

```powershell
# 1. Создание резервной копии
Copy-Item .opencode\opencode.json .opencode\opencode.json.full-backup

# 2. Удаление конфигурации
Remove-Item .opencode\opencode.json -Force

# 3. Копирование old версии
Copy-Item .opencode\opencode.json.old .opencode\opencode.json

# 4. Проверка
Test-Path .opencode\opencode.json
```

---

## Полезные скрипты

### Скрипт 1: Полная диагностика

```powershell
# opencode-diagnose.ps1
Write-Host "=== OpenCode Diagnostic Script ===" -ForegroundColor Cyan

# Node.js
Write-Host "`n[1] Node.js Check" -ForegroundColor Yellow
node --version
npm --version

# Ollama
Write-Host "`n[2] Ollama Check" -ForegroundColor Yellow
ollama --version
ollama list

# OpenCode Structure
Write-Host "`n[3] OpenCode Structure" -ForegroundColor Yellow
Get-ChildItem .opencode -Directory | Select-Object Name

# Config Validation
Write-Host "`n[4] Config Validation" -ForegroundColor Yellow
try {
  Get-Content .opencode\opencode.json -Raw | ConvertFrom-Json | Out-Null
  Write-Host "✅ opencode.json is valid" -ForegroundColor Green
} catch {
  Write-Host "❌ opencode.json is invalid" -ForegroundColor Red
}

# MCP Check
Write-Host "`n[5] MCP Check" -ForegroundColor Yellow
if (Test-Path .opencode\node_modules\@modelcontextprotocol) {
  Write-Host "✅ MCP packages installed" -ForegroundColor Green
} else {
  Write-Host "❌ MCP packages not installed" -ForegroundColor Red
}

# Logs Check
Write-Host "`n[6] Logs Check" -ForegroundColor Yellow
Get-ChildItem .opencode\logs\*.log -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "  $($_.Name) - $($_.Length) bytes"
}

Write-Host "`n=== Diagnostic Complete ===" -ForegroundColor Cyan
```

### Скрипт 2: Быстрое восстановление

```powershell
# opencode-fix.ps1
Write-Host "=== OpenCode Quick Fix ===" -ForegroundColor Cyan

# Fix permissions
Write-Host "[1] Fixing permissions..." -ForegroundColor Yellow
icacls .opencode /grant Users:F /T

# Clean cache
Write-Host "[2] Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Path "$env:LOCALAPPDATA\opencode\Cache" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall MCP
Write-Host "[3] Reinstalling MCP packages..." -ForegroundColor Yellow
Remove-Item .opencode\node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm install --prefix .opencode

# Clear context
Write-Host "[4] Clearing context..." -ForegroundColor Yellow
Remove-Item .opencode\context\*.json -Force -ErrorAction SilentlyContinue

Write-Host "`n=== Quick Fix Complete ===" -ForegroundColor Cyan
Write-Host "Restart OpenCode to apply changes" -ForegroundColor Yellow
```

### Скрипт 3: Мониторинг логов

```powershell
# opencode-monitor.ps1
Write-Host "=== OpenCode Log Monitor ===" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

while ($true) {
  Clear-Host
  
  Write-Host "=== Guard Audit (Last 10) ===" -ForegroundColor Yellow
  if (Test-Path .opencode\logs\guard-audit.log) {
    Get-Content .opencode\logs\guard-audit.log -Tail 10
  } else {
    Write-Host "No guard-audit.log" -ForegroundColor Gray
  }
  
  Write-Host "`n=== Quality Gates (Last 10) ===" -ForegroundColor Yellow
  if (Test-Path .opencode\logs\quality-gates.log) {
    Get-Content .opencode\logs\quality-gates.log -Tail 10
  } else {
    Write-Host "No quality-gates.log" -ForegroundColor Gray
  }
  
  Write-Host "`n=== Pipelines (Last 10) ===" -ForegroundColor Yellow
  if (Test-Path .opencode\logs\pipelines.log) {
    Get-Content .opencode\logs\pipelines.log -Tail 10
  } else {
    Write-Host "No pipelines.log" -ForegroundColor Gray
  }
  
  Start-Sleep -Seconds 5
}
```

---

## Связанные документы

- [CONFIGURATION.md](./CONFIGURATION.md) — Конфигурация OpenCode
- [AGENTS_GUIDE.md](./AGENTS_GUIDE.md) — Руководство по агентам
- [QUICK_START.md](./QUICK_START.md) — Быстрый старт

---

**Версия документации:** 1.0.0  
**Дата создания:** 2026-06-14
