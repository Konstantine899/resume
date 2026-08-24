# OpenCode Setup Guide

**Проект:** Resume Portfolio  
**Версия:** 3.0.0  
**Дата:** 2026-07-18  
**Статус:** ✅ Ready

---

## 📋 Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | >= 20.x | [nodejs.org](https://nodejs.org) |
| **npm** | >= 10.x | Included with Node.js |
| **Git** | >= 2.40 | [git-scm.com](https://git-scm.com) |
| **WSL2** | Latest | [WSL2 Setup](https://learn.microsoft.com/en-us/windows/wsl/install) |

### Optional

| Software | Purpose |
|----------|---------|
| **Docker Desktop** | Containerization |
| **VS Code** | Recommended IDE |

---

## 🚀 Installation

### Step 1: Clone

```powershell
cd D:\Dev\projects
git clone <repository-url> resume
cd resume
```

### Step 2: Install dependencies

```powershell
npm install
```

### Step 3: Environment setup

```powershell
cp .env.example .env
# Edit .env with required variables
```

### Step 4: WSL2 setup (for Serena MCP)

```powershell
wsl --version
wsl --install -d Ubuntu
wsl -e bash -c "curl -LsSf https://astral.sh/uv/install.sh | sh"
wsl -e bash -c "uvx --from git+https://github.com/oraios/serena serena --version"
```

---

## ✅ Verification

### Check 1: Node.js and npm

```powershell
node --version
# Expected: v20.x.x or higher

npm --version
# Expected: 10.x.x or higher
```

### Check 2: Git

```powershell
git --version
# Expected: git version 2.40.x or higher
```

### Check 3: WSL2

```powershell
wsl --list --verbose
# Expected: Ubuntu (or other distro) in Running state
```

### Check 4: Serena MCP

```powershell
wsl -e bash -c "uvx --from git+https://github.com/oraios/serena serena start-mcp-server --help"
# Expected: Help output without errors
```

### Check 5: OpenCode

```powershell
opencode --version
# Expected: version output
```

---

## 🔧 Troubleshooting

### WSL2 not installed

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
shutdown /r /t 0
wsl --set-default-version 2
wsl --install -d Ubuntu
```

### Serena not starting in WSL

```bash
# Inside WSL (Ubuntu)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
uvx --from git+https://github.com/oraios/serena serena --version
```

### MCP servers not connecting

```powershell
# Check logs
Get-Content .opencode\logs\mcp-*.log -Tail 50
```

---

## 📚 Next Steps

After successful setup:

1. **Read the docs:**
   - `.opencode/docs/AGENTS.md` — project rules and agents
   - `.opencode/docs/QUICK_START.md` — quick start guide
   - `.opencode/docs/TROUBLESHOOTING.md` — common issues

2. **Start development:**
   ```powershell
   npm run dev
   ```

---

## 🎯 Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript validation |
| `npm run validate` | TypeScript + ESLint + Stylelint |

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review logs in `.opencode/logs/`
3. Create an issue in the repository

---

**Setup Guide v2.0 — Resume Portfolio Project** ✅
