# 🔍 Senior Plugin Debugging Prompt — OpenCode Metrics Logger

## 📋 Контекст проблемы

**Ситуация:**
- Плагин `metrics-logger` работал 18 июня 2026 (собрал 17 запросов, 8500 токенов)
- 21 июня плагин перестал работать (нет логов, нет сообщений в консоли)
- Конфигурация изменилась минимально (обновлена версия плагина)

**Текущее состояние:**
```json
// Глобальный конфиг: ~/.config/opencode/opencode.jsonc
{
  "plugin": ["./plugins/metrics-logger.js"],
  "model": "ollama-cloud/gpt-oss:20b-cloud"
}

// Локальный конфиг: .opencode/opencode.json
{
  // plugin удалён
  "model": "ollama-cloud/gpt-oss:20b-cloud"
}
```

---

## 🎯 Задача

Провести полную диагностику плагина `metrics-logger` и восстановить его работоспособность.

---

## 📊 Полная конфигурация OpenCode

### Глобальная конфигурация

**Файл:** `~/.config/opencode/opencode.jsonc`

**Содержимое:** См. `./global-opencode-config.jsonc`

**Ключевые параметры:**
```jsonc
{
  "model": "ollama-cloud/gpt-oss:20b-cloud",
  "small_model": "ollama-local/qwen2.5-coder:7b-instruct-q4_K_M",
  "plugin": ["./plugins/metrics-logger.js"],
  "provider": {
    "ollama-local": { ... },
    "ollama-cloud": {
      "models": {
        "qwen3-coder:480b-cloud": {},
        "qwen3.5:397b-cloud": {},
        "glm-4.6:cloud": {},
        "minimax-m2:cloud": {},
        "qwen3-vl:235b-cloud": {},
        "deepseek-v3.1:671b-cloud": {},
        "kimi-k2.5:cloud": {},
        "gpt-oss:20b-cloud": {}
      }
    }
  },
  "mcp": { ... },
  "permission": { "*": "ask" }
}
```

---

### Локальная конфигурация проекта

**Файл:** `.opencode/opencode.json`

**Содержимое:** См. `./local-opencode-config.json`

**Ключевые параметры:**
```json
{
  "model": "ollama-cloud/gpt-oss:20b-cloud",
  "small_model": "ollama-local/qwen2.5-coder:7b-instruct-q4_K_M",
  "logLevel": "INFO",
  "snapshot": true,
  "instructions": [".opencode/docs/AGENTS.md"],
  "skills": { "paths": [".opencode/skills"] },
  "mcp": { ... },
  "formatter": true,
  "lsp": true
}
```

---

### Плагин metrics-logger

**Файл:** `~/.config/opencode/plugins/metrics-logger.js`

**Содержимое:** См. `./metrics-logger-plugin.js`

**Структура:**
```javascript
module.exports = {
  name: 'metrics-logger',
  version: '1.0.0',
  hooks: {
    'message.start': ...,
    'message.complete': ...,
    'tool.complete': ...,
    'session.end': ...
  }
}
```

---

### Скрипт сбора метрик

**Файл:** `.opencode/scripts/collect-from-obsidian.ps1`

**Содержимое:** См. `./collect-from-obsidian-script.ps1`

**Расписание:** Task Scheduler, ежедневно в 22:05

---

## 📊 Доказательства работы (18 июня)

**Файл:** `D:\Dev\projects\resume\.opencode\logs\metrics\daily-2026-06-18.json`

```json
{
  "totalRequests": 17,
  "totalTokens": 8500,
  "avgTokensPerRequest": 500,
  "status": "collected",
  "source": "obsidian"
}
```

**Вывод:** Плагин корректно:
- Перехватывал хуки `message.start` / `message.complete`
- Извлекал `tokenUsage` из ответов
- Записывал логи в Obsidian
- Task Scheduler успешно собирал метрики

---

### 2. Текущая структура плагина

**Файл:** `~/.config/opencode/plugins/metrics-logger.js`

```javascript
module.exports = {
  name: 'metrics-logger',
  version: '1.0.0',
  
  hooks: {
    'message.start': async (event) => {
      currentModel = event.input?.model || 'unknown'
      currentAgent = detectAgent(event.input?.message)
      messageStartTime = Date.now()
    },
    
    'message.complete': async (event) => {
      const tokens = event.output?.tokenUsage?.total || 0
      const duration = Date.now() - messageStartTime
      
      if (tokens > 0) {
        logToObsidian(tokens, currentAgent, currentModel, duration)
      }
    }
  }
}
```

---

### 3. Известные хуки OpenCode (из документации)

**Подтверждённые хуки:**
- `chat.message` — новый запрос (sessionID, model, messageID)
- `tool.execute.before` — перед выполнением инструмента
- `tool.definition` — определение инструмента
- `config` — конфигурация системы
- `permission.ask` — запрос разрешения

**Экспериментальные хуки:**
- `chat.transform` — трансформация чата
- `session.transform` — трансформация сессии

**НЕ подтверждённые:**
- `message.start`
- `message.complete`

---

## 🔍 План диагностики

### Шаг 1: Проверка загрузки плагина

**Команда:**
```bash
opencode --verbose
# или
opencode /status
```

**Ожидаемый результат:**
```
[info] Loading plugin: metrics-logger
[info] Plugin loaded: metrics-logger v1.0.0
```

**Если нет:**
- Проверить путь к плагину
- Проверить синтаксис JavaScript
- Проверить зависимости (Node.js modules)

---

### Шаг 2: Проверка регистрации хуков

**Проблема:** Хуки `message.start` / `message.complete` могут не существовать в OpenCode.

**Решение:** Использовать подтверждённые хуки:

```javascript
hooks: {
  // Вместо message.start
  'chat.message': (input, output) => {
    // input: { sessionID, agent, model, messageID }
    // output: { message: UserMessage, parts: Part[] }
    messageStartTime = Date.now()
    currentModel = input.model?.modelID || 'unknown'
  },
  
  // Вместо message.complete
  'tool.execute.before': (input, output) => {
    // input: { toolName, args }
    // output: { modifiedArgs? }
  }
}
```

---

### Шаг 3: Проверка структуры event

**Проблема:** Структура `event.input` / `event.output` может отличаться.

**Диагностика:** Добавить логирование всей структуры:

```javascript
'message.start': async (event) => {
  console.log('[metrics] DEBUG event.input:', JSON.stringify(event.input, null, 2))
  console.log('[metrics] DEBUG event.output:', JSON.stringify(event.output, null, 2))
}
```

**Ожидаемая структура:**
```javascript
event = {
  input: {
    message: "Создай компонент",
    model: "ollama-cloud/gpt-oss:20b-cloud",
    agent: "ui",
    // ...
  },
  output: {
    tokenUsage: {
      total: 5200,
      promptTokens: 2000,
      completionTokens: 3200
    },
    // ...
  }
}
```

---

### Шаг 4: Проверка путей к файлам

**OBSIDIAN_PATH:**
```javascript
const OBSIDIAN_PATH = 'D:/Dev/tools/DBObsidian/resume-app'
```

**Проверка:**
```powershell
Test-Path "D:/Dev/tools/DBObsidian/resume-app/logs"
# Должно вернуть: True

New-Item -ItemType Directory -Force -Path "D:/Dev/tools/DBObsidian/resume-app/logs"
# Создать если не существует
```

---

### Шаг 5: Проверка Encoding файлов

**Проблема:** Файлы Obsidian могут быть в UTF-8 BOM, а плагин пишет UTF-8 без BOM.

**Решение:**
```javascript
fs.appendFileSync(metricsFile, logEntry, { encoding: 'utf8' })
// Или с явным BOM:
fs.appendFileSync(metricsFile, '\uFEFF' + logEntry, { encoding: 'utf8' })
```

---

## 🛠️ Решения

### Решение 1: Исправить хуки (наиболее вероятно)

**Проблема:** Хуки `message.start` / `message.complete` не существуют.

**Решение:** Использовать `chat.message`:

```javascript
module.exports = {
  name: 'metrics-logger',
  version: '1.0.0',
  
  hooks: {
    'chat.message': async (input, output) => {
      // input: { sessionID, model: {providerID, modelID}, agent, messageID }
      // output: { message: UserMessage, parts: Part[] }
      
      const model = input.model?.modelID || 'unknown'
      const agent = input.agent || 'unknown'
      const message = output.message?.content || ''
      
      console.log(`[metrics] chat.message: model=${model}, agent=${agent}`)
      
      // Сохранить контекст для следующего хука
      currentContext = { model, agent, startTime: Date.now() }
    },
    
    // Для перехвата токенов использовать tool.execute.after
    'tool.execute.before': async (input, output) => {
      // Здесь можно получить tokenUsage после выполнения
    }
  }
}
```

---

### Решение 2: Добавить логирование для отладки

```javascript
hooks: {
  'chat.message': async (input, output) => {
    console.log('[metrics] === CHAT.MESSAGE ===')
    console.log('[metrics] INPUT:', JSON.stringify(input, null, 2))
    console.log('[metrics] OUTPUT:', JSON.stringify(output, null, 2))
    console.log('[metrics] ====================')
  }
}
```

---

### Решение 3: Использовать альтернативный подход

Если хуки не работают, использовать **перехват вывода OpenCode**:

**Скрипт-обёртка PowerShell:**
```powershell
# opencode-with-metrics.ps1
$process = Start-Process -FilePath "opencode" -ArgumentList @($args) -PassThru -NoNewWindow

# Перехват вывода
$process.StandardOutput.ReadToEnd() | ForEach-Object {
    if ($_ -match "(\d+) tokens") {
        $tokens = $matches[1]
        # Записать в Obsidian
        Add-Content "D:/Dev/tools/DBObsidian/resume-app/logs/metrics-$(Get-Date -Format 'yyyy-MM-dd').md" $tokens
    }
}
```

---

## 📋 Чеклист для исполнителя

- [ ] Проверить загрузку плагина (`opencode --verbose`)
- [ ] Проверить синтаксис JavaScript (`node --check metrics-logger.js`)
- [ ] Изучить документацию OpenCode Plugin Hooks
- [ ] Заменить `message.start` / `message.complete` на `chat.message`
- [ ] Добавить отладочное логирование (`console.log`)
- [ ] Проверить пути к файлам Obsidian
- [ ] Проверить кодировку файлов
- [ ] Протестировать с простым запросом
- [ ] Проверить консоль на наличие `[metrics]` сообщений
- [ ] Проверить файл лога Obsidian

---

## 🎯 Ожидаемый результат

После исправления:

1. **При запуске OpenCode:**
   ```
   [info] Loading plugin: metrics-logger
   [info] Plugin loaded: metrics-logger v1.0.0
   ```

2. **При запросе:**
   ```
   [metrics] chat.message: model=ollama-cloud/gpt-oss:20b-cloud, agent=ui
   [metrics] Logged: 5200 tokens, 4500ms, model=ollama-cloud/gpt-oss:20b-cloud
   ```

3. **В файле Obsidian:**
   ```markdown
   ## 21.06.2026, 20:45:32
   
   - **Agent:** ui
   - **Model:** ollama-cloud/gpt-oss:20b-cloud
   - **Tokens:** 5200
   - **Duration:** 4500ms
   - **Task:** create
   ```

4. **В 22:05 Task Scheduler:**
   ```
   [obsidian-collect] Found 10 agent calls, 52000 tokens
   [obsidian-collect] Top models by token usage:
     gpt-oss:20b-cloud: 40000 tokens, 8 requests
     qwen3.5:397b-cloud: 12000 tokens, 2 requests
   ```

---

## 📚 Ресурсы

- **Документация плагинов:** `specs/v2/provider-model.md`
- **Примеры хуков:** `packages/plugin/src/index.ts`
- **Рабочая конфигурация (18 июня):** `daily-2026-06-18.json`
- **Текущий плагин:** `~/.config/opencode/plugins/metrics-logger.js`

---

**Задача:** Восстановить работоспособность плагина используя подтверждённые хуки OpenCode.
