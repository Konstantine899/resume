# OpenCode Setup Guide

**Проект:** Resume Portfolio  
**Версия:** 3.0.0  
**Дата:** 2026-07-07  
**Статус:** ✅ Ready

---

## 📋 Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | >= 20.x | [nodejs.org](https://nodejs.org) |
| **npm** | >= 10.x | Включён в Node.js |
| **Git** | >= 2.40 | [git-scm.com](https://git-scm.com) |
| **WSL2** | Latest | [WSL2 Setup](https://learn.microsoft.com/en-us/windows/wsl/install) |

### Optional (для расширенной функциональности)

| Software | Назначение |
|----------|------------|
| **Docker Desktop** | Контейнеризация |
| **Obsidian** | База знаний (DBObsidian) |
| **VS Code** | Recommended IDE |

---

## 🚀 Installation

### Шаг 1: Клонирование репозитория

```powershell
# PowerShell
cd D:\Dev\projects
git clone <repository-url> resume
cd resume
```

### Шаг 2: Установка зависимостей

```powershell
# Установка npm зависимостей
npm install

# Проверка установки
npm run doctor
```

### Шаг 3: Настройка окружения

```powershell
# Копирование .env.example
cp .env.example .env

# Редактирование .env (обязательные переменные):
# - API_KEY=your_api_key_here
# - SERENA_WSL_ENABLED=true
# - MCP_SERVER_TIMEOUT=30000
```

### Шаг 4: Настройка WSL2 (для Serena MCP)

```powershell
# Проверка WSL2
wsl --version

# Установка Ubuntu (если не установлен)
wsl --install -d Ubuntu

# Запуск Serena в WSL
wsl -e bash -c "curl -LsSf https://astral.sh/uv/install.sh | sh"
wsl -e bash -c "uvx --from git+https://github.com/oraios/serena serena --version"
```

---

## ✅ Verification

### Check 1: Node.js и npm

```powershell
node --version
# Ожидаемо: v20.x.x или выше

npm --version
# Ожидаемо: 10.x.x или выше
```

### Check 2: Git

```powershell
git --version
# Ожидаемо: git version 2.40.x или выше
```

### Check 3: WSL2

```powershell
wsl --list --verbose
# Ожидаемо: Ubuntu (или другой дистрибутив) в состоянии Running
```

### Check 4: Serena MCP

```powershell
# Запуск Serena через WSL
wsl -e bash -c "uvx --from git+https://github.com/oraios/serena serena start-mcp-server --help"
# Ожидаемо: Help output без ошибок
```

### Check 5: OpenCode Agents

```powershell
# Проверка доступности агентов
npm run agents:list
# Ожидаемо: Список из 15+ агентов
```

### Check 6: MCP Servers

```powershell
# Проверка MCP подключения
npm run mcp:health
# Ожидаемо: 7/7 серверов active
```

---

## 🔧 Troubleshooting

### Проблема: WSL2 не установлен

**Решение:**
```powershell
# Включить WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Включить Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Перезагрузить компьютер
shutdown /r /t 0

# Установить WSL2 по умолчанию
wsl --set-default-version 2

# Установить Ubuntu
wsl --install -d Ubuntu
```

---

### Проблема: Serena не запускается в WSL

**Решение:**
```bash
# Внутри WSL (Ubuntu)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Проверка
uvx --from git+https://github.com/oraios/serena serena --version
```

---

### Проблема: MCP сервера не подключаются

**Диагностика:**
```powershell
# Проверка логов
Get-Content .opencode\logs\mcp-*.log -Tail 50

# Перезапуск MCP
npm run mcp:restart

# Проверка статуса
npm run mcp:status
```

---

### Проблема: Agents не отвечают

**Решение:**
```powershell
# Проверка подключения к Ollama Cloud
npm run ollama:health

# Перезапуск агентов
npm run agents:restart

# Проверка логов
Get-Content .opencode\logs\agents-*.log -Tail 50
```

---

## 📚 Next Steps

После успешной настройки:

1. **Изучить документацию:**
   - `.opencode/docs/README.md` — общая документация
   - `.opencode/agents/README.md` — агенты
   - `.opencode/plugins/README.md` — плагины

2. **Запустить первый workflow:**
   ```powershell
   npm run dev
   ```

3. **Настроить Obsidian (опционально):**
   - Открыть `DBObsidian\resume-app` в Obsidian
   - Установить плагин Dataview
   - Проверить индекс `index.md`

---

## 🎯 Quick Commands

| Command | Описание |
|---------|----------|
| `npm run dev` | Запуск development сервера |
| `npm run build` | Production сборка |
| `npm run test` | Запуск тестов |
| `npm run lint` | ESLint проверка |
| `npm run typecheck` | TypeScript валидация |
| `npm run mcp:health` | Проверка MCP серверов |
| `npm run agents:list` | Список агентов |
| `npm run ollama:health` | Проверка Ollama подключения |

---

## 📞 Support

Если возникли проблемы:

1. Проверить [Troubleshooting](#troubleshooting) секцию
2. Изучить логи в `.opencode/logs/`
3. Создать issue в репозитории
4. Обратиться в чат поддержки

---

**Setup Guide v1.0 — Resume Portfolio Project** ✅
