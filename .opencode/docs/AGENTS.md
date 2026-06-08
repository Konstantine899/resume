# Project Configuration - Resume Project

## 🎯 Technology Stack

- **Framework:** React 19.2.4 + Hooks
- **Build Tool:** Vite 7.3.1 + Tree-shaking
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** SASS + CSS Modules
- **State Management:** Redux Toolkit (planned migration)
- **Testing:** Vitest 4.1 + Playwright 1.59 + Storybook 10.3
- **Architecture:** Feature-Sliced Design (FSD)
- **i18n:** i18next 26 + react-i18next 17
- **Icons:** Lucide React 0.468 + React Icons 5.6
- **Backend:** REST API

## 📁 Project Structure

```
src/
├── entities/     # Business entities
├── features/     # User interactions
├── pages/        # Application pages
├── widgets/      # Composite components
└── shared/       # Reusable resources
    ├── api/      # API clients
    ├── lib/      # Helper functions
    ├── styles/   # Global styles
    ├── types/    # Global types
    └── ui/       # UI components
```

## 🏗️ FSD Layer Dependencies

| Layer    | Can Import                                 |
| -------- | ------------------------------------------ |
| app      | pages, widgets, features, entities, shared |
| pages    | widgets, features, entities, shared        |
| widgets  | features, entities, shared                 |
| features | entities, shared                           |
| entities | shared (types only)                        |
| shared   | shared only                                |

## 📋 Rules Applied

All rules in `.opencode/rules/` are automatically applied:

- **fsd-rules.md** - FSD architecture rules
- **code-style-rules.md** - TypeScript + React code style
- **performance-rules.md** - Performance budgets
- **security-rules.md** - Security requirements
- **testing-rules.md** - Testing standards
- **strict-rules.md** - Absolute bans

## 🤖 Available Agents

Specialized agents in `.opencode/agents/`:

- **orchestrator** - Главный диспетчер: роутинг задач, выбор модели, координация агентов
- **fsd-validator** - FSD architecture validation
- **fsd-import-validator** - Import validation between layers
- **review** - Code review (React 19 + TS + RTK)
- **style** - SASS + CSS Modules validation
- **ui** - UI component creation
- **integration-test** - Integration testing
- **performance-test** - Performance testing
- **storybook-test** - Storybook coverage
- **prompt-refinement** - Prompt improvement

### 🎯 Model Levels

| Level    | Model         | Use Case                            |
| -------- | ------------- | ----------------------------------- |
| Simple   | deepseek:1.3b | Правки, комментарии, форматирование |
| Standard | qwen:7b       | Компоненты, тесты, багфиксы         |
| Complex  | qwen:32b      | Рефакторинг, интеграции, отладка    |
| Expert   | deepseek:671b | Архитектура, аудит, прод-баги       |

## 🔄 Available Pipelines

Automatic task chains in `.opencode/pipelines.jsonc`:

| Pipeline             | Trigger               | Steps | Time   | Use Case                  |
| -------------------- | --------------------- | ----- | ------ | ------------------------- |
| **create-component** | "создай компонент"    | 6     | ~3 min | Full component creation   |
| **code-review**      | "проверь код"         | 5     | ~2 min | Comprehensive code review |
| **fix-bug**          | "исправь баг"         | 4     | ~2 min | Bug diagnosis and fix     |
| **refactor**         | "рефакторинг"         | 5     | ~3 min | Safe code refactoring     |
| **integration-test** | "интеграционный тест" | 5     | ~3 min | Integration testing       |

### Pipeline Features:

- ✅ Automatic trigger detection
- ✅ Sequential & Parallel execution
- ✅ Retry & Rollback strategies
- ✅ Quality gates per step
- ✅ Full logging & metrics

## 🧠 Shared Context

Memory system in `.opencode/context/`:

| Category        | Storage             | TTL | Purpose                   |
| --------------- | ------------------- | --- | ------------------------- |
| **Decisions**   | project-memory.json | ∞   | Architectural decisions   |
| **Patterns**    | project-memory.json | ∞   | Code patterns & templates |
| **Mistakes**    | project-memory.json | 7d  | Learned mistakes          |
| **Preferences** | project-memory.json | ∞   | Developer preferences     |

### Context Features:

- ✅ Shared memory between agents
- ✅ Auto-learning from mistakes
- ✅ Pattern-based code generation
- ✅ Privacy filtering
- ✅ Full logging & metrics

## 🚪 Quality Gates

Automatic quality checks in `.opencode/quality-gates.jsonc`:

| Gate           | Trigger    | Checks | Blocking | Use Case             |
| -------------- | ---------- | ------ | -------- | -------------------- |
| **Pre-Commit** | git commit | 6      | ✅ Yes   | Basic quality check  |
| **Pre-Merge**  | git merge  | 5      | ✅ Yes   | Comprehensive review |
| **Pre-Deploy** | npm deploy | 4      | ✅ Yes   | Production readiness |

### Quality Gate Features:

- ✅ Automatic validation before commits
- ✅ Auto-fix for minor issues
- ✅ Security & performance checks
- ✅ Full reporting & metrics

## ⚡ Parallel Execution

Parallel task execution in `.opencode/parallel-execution.jsonc`:

| Group              | Tasks                      | Max Concurrent | Speedup | Use Case           |
| ------------------ | -------------------------- | -------------- | ------- | ------------------ |
| **Test Suite**     | unit, integration, e2e     | 3              | 2.25x   | All tests          |
| **Code Review**    | security, performance, fsd | 2              | 1.6x    | Review suite       |
| **Component**      | tsx, scss, types           | 3              | 2.17x   | Component creation |
| **Quality Checks** | security, perf, style      | 3              | 2.67x   | Quality gates      |

### Parallel Features:

- ✅ 3 scheduling strategies (balanced, speed, conservative)
- ✅ Resource management (CPU/RAM limits)
- ✅ Result aggregation
- ✅ Speedup metrics & reporting

## 🔁 Feedback Loop

Auto-learning system in `.opencode/feedback-loop.jsonc`:

| Source              | Analysis          | Output      | Auto-Apply |
| ------------------- | ----------------- | ----------- | ---------- |
| **Mistakes**        | Pattern detection | Rules       | ✅ Yes     |
| **Task Results**    | Success rate      | Suggestions | ✅ Yes     |
| **Quality Gates**   | Failure analysis  | Rules       | ✅ Yes     |
| **Manual Feedback** | Priority          | Fixes       | ✅ Yes     |

### Feedback Features:

- ✅ Auto-learning from mistakes
- ✅ Rule generation
- ✅ Weekly reports
- ✅ Improvement tracking

## 📚 Instructions

Context and guidelines in `.opencode/instructions/`:

- **fsd-architecture.md** - FSD layer rules
- **project-structure.md** - Project overview
- **style-guide.md** - Style guidelines
- **review-guidelines.md** - Code review standards
- **eslint-config.md** - ESLint configuration

## ✅ Quality Gates

### Automatic Approval:

- Zero circular dependencies
- 100% layer compliance
- No linting errors
- Performance budgets met

### Automatic Rejection:

- Any circular dependency
- Layer violation detected
- Missing type annotations
- Security vulnerabilities
