# OpenCode Project Configuration

**Проект:** Resume Portfolio  
**Версия:** 3.0.0  
**Дата:** 2026-07-18

---

## 📁 Structure

```
.opencode/
├── opencode.json              # Control plane: config, permissions, MCP, providers
├── agents/                    # 5 project-specific subagents
│   ├── orchestrator.md
│   ├── guard.md
│   ├── review.md
│   ├── integration-test.md
│   └── git-commit.md
├── skills/                    # 4 curated skills
│   ├── component-boilerplate/
│   ├── fsd-design/
│   ├── storybook-setup/
│   └── test-generation/
├── commands/                  # Custom prompt templates
│   └── switch-profile.md
├── config/                    # Machine-readable configs
│   ├── feedback-loop.jsonc
│   ├── parallel-execution.jsonc
│   ├── pipelines.jsonc
│   └── quality-gates.jsonc
├── docs/                      # Documentation
│   ├── AGENTS.md
│   ├── CONFIGURATION.md
│   ├── DECISION-FRAMEWORK.md
│   ├── PLAN-REFACTORING-ADOPT.md
│   ├── QUICK_START.md
│   ├── SETUP.md
│   └── TROUBLESHOOTING.md
├── plugins/                   # 11 plugins
├── logs/                      # Runtime (gitignored)
└── context/                   # Runtime (gitignored)
```

---

## 🎯 Architecture Principles

### Layer Separation

| Directory | Purpose | In Git? |
|-----------|---------|---------|
| `agents/` | Project-specific subagents | ✅ |
| `skills/` | Curated skills | ✅ |
| `commands/` | Custom prompt templates | ✅ |
| `config/` | Machine-readable configs | ✅ |
| `docs/` | Documentation | ✅ |
| `plugins/` | Runtime plugins | ✅ |
| `logs/` | Execution logs | ❌ |
| `context/` | Context store | ❌ |

### Configuration vs Documentation

**Configuration (`config/`, `opencode.json`):**
- Machine-readable files (JSON/JSONC)
- Used by the system at runtime
- Versioned

**Documentation (`docs/`):**
- Human-readable files (Markdown)
- For developers and team
- Versioned

---

## 🎯 Architecture Principles

### 1. Separation of concerns

- `opencode.json` — control plane (config, permissions, MCP, providers)
- `agents/` — role-based subagents with clear operational boundaries
- `skills/` — reusable knowledge packages
- `commands/` — prompt templates for common scenarios
- `config/` — machine-readable runtime configs
- `docs/` — human-readable documentation

### 2. Instructions composition

Knowledge is layered, not monolithic:
- `AGENTS.md` — project contract (rules, structure, agents)
- `docs/specs/*.md` — functional and technical specifications
- Skills — reusable domain knowledge
- Commands — prompt templates for common scenarios

### 3. Permission model

- Read/search — allow
- Local edits — allow
- Dangerous bash (push, rm -rf, docker, gh) — ask
- Skills — whitelist (4 project skills)

---

## 🎯 Maturity: Stage 4/5

| Stage | What's in place |
|-------|----------------|
| 1. Init + AGENTS.md | ✅ |
| 2. opencode.json + instructions + specs | ✅ |
| 3. Project-specific agents | ✅ (5 agents) |
| 4. Curated skills + permission policy | ✅ (4 skills, whitelist, bash patterns) |
| 5. Team processes + onboarding | 🟡 SETUP.md, QUICK_START.md, commands |

---

## 📚 Navigation

### Configuration
- [opencode.json](../opencode.json) — Control plane
- [config/pipelines.jsonc](./config/pipelines.jsonc) — Pipelines
- [config/quality-gates.jsonc](./config/quality-gates.jsonc) — Quality gates

### Documentation
- [docs/AGENTS.md](./docs/AGENTS.md) — Project rules and agents
- [docs/QUICK_START.md](./docs/QUICK_START.md) — Quick start
- [docs/SETUP.md](./docs/SETUP.md) — Setup guide
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) — Common issues

### Agents
- [agents/orchestrator.md](./agents/orchestrator.md) — Task decomposition and dispatch
- [agents/guard.md](./agents/guard.md) — Security premoderation
- [agents/review.md](./agents/review.md) — Code review and quality
- [agents/integration-test.md](./agents/integration-test.md) — Integration and e2e tests
- [agents/git-commit.md](./agents/git-commit.md) — Commits with validation

---

**Status:** ✅ Configured  
**Maturity:** Stage 4/5
