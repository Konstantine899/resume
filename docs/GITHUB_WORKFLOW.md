# 🤝 GitHub Workflow для FSD проектов

## 🎯 Цель
Настроить эффективный процесс командной разработки с использованием GitHub, оптимизированный для Feature-Sliced Design архитектуры.

## 🚀 Быстрый старт

### Доступные команды в AI ассистенте:

```
/github init        # Инициализировать репозиторий
/github branch      # Создать feature ветку
/github commit      # Создать коммит
/github pr          # Создать Pull Request
/github issue       # Создать Issue
/github review      # Code Review рекомендации
/github actions     # Настроить GitHub Actions
```

## 📁 Базовая настройка репозитория

### 1. Инициализация репозитория

```bash
# Локальная инициализация
git init
git add .
git commit -m "feat: initial commit with FSD architecture"

# Создание на GitHub (через CLI)
gh repo create my-project --public --description "Project with FSD architecture"

# Или через Web UI
# 1. Зайди на GitHub.com
# 2. Create new repository
# 3. Следуй инструкциям
```

### 2. Настройка базовых файлов

#### .gitignore для FSD проекта:
```gitignore
# Dependencies
node_modules/

# Production builds
/dist
/build
/.next
/out

# Environment variables
.env*.local
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
```

## 🌿 Branch стратегия для FSD

### Названия веток по FSD слоям:

```bash
# Shared layer компоненты
feature/fsd-shared-button-component
feature/fsd-shared-input-improvements
fix/fsd-shared-styles-fix

# Entities layer
feature/fsd-entities-user-model
feature/fsd-entities-product-types

# Features layer  
feature/fsd-features-auth-implementation
feature/fsd-features-dashboard-widgets

# Widgets layer
feature/fsd-widgets-sidebar-navigation
feature/fsd-widgets-header-responsive

# Pages layer
feature/fsd-pages-home-redesign
feature/fsd-pages-about-content
```

### Рабочий процесс:

```bash
# 1. Переключись на develop ветку
git checkout develop
git pull origin develop

# 2. Создай feature ветку
git checkout -b feature/fsd-features-auth-implementation

# 3. Разрабатывай фичу
# ... разработка ...

# 4. Создай коммиты
git add .
git commit -m "feat(features/auth): add login form component"
git commit -m "feat(features/auth): implement authentication logic"

# 5. Запушь ветку
git push origin feature/fsd-features-auth-implementation
```

## 💾 Conventional Commits для FSD

### Структура коммитов:

```bash
# Shared layer
feat(shared/ui): add Button component with variants
fix(shared/styles): correct color variables
docs(shared): update component usage examples

# Entities layer  
feat(entities/user): implement User type definitions
fix(entities/api): resolve data fetching issue

# Features layer
feat(features/auth): implement login functionality
refactor(features/dashboard): optimize data loading

# Общие коммиты
chore: update dependencies
test: add unit tests for auth feature
ci: setup GitHub Actions workflow
```

### Пример полного коммита:

```bash
git commit -m "feat(features/auth): implement user authentication

- Add login form component with validation
- Implement useAuth hook for state management
- Add authentication API integration
- Create protected route component
- Add error handling and loading states

Closes #123
"
```

## 🔄 Pull Request процесс

### Создание PR:

```bash
# После push ветки
gh pr create \
  --title "feat(features/auth): implement user authentication" \
  --body "Please review the authentication feature implementation" \
  --reviewer team-member \
  --label "fsd-features"
```

### PR описание (шаблон):

```markdown
## 🎯 Что сделано

### FSD Changes
**Layer: Features**
- Добавлена форма логина в `features/auth/ui/LoginForm.tsx`
- Реализована логика аутентификации в `features/auth/hooks/useAuth.ts`
- Добавлены типы в `features/auth/types.ts`

**Layer: Shared**
- Обновлен Button компонент для поддержки auth states
- Добавлены новые иконки в `shared/ui/Icons`

### Changes Summary
- ✅ Добавлена аутентификация пользователей
- ✅ Интегрирована с API
- ✅ Добавлена валидация форм
- ✅ Реализована обработка ошибок

## 🧪 Тестирование

### Manual Testing
- [ ] Логин с корректными данными работает
- [ ] Логин с некорректными данными показывает ошибку
- [ ] Logout корректно очищает сессию
- [ ] Protected routes перенаправляют на логин

### Automated Testing
- [ ] Unit tests для useAuth хука
- [ ] Component tests для LoginForm
- [ ] Integration tests для auth flow

## 📁 Changed Files
```
features/auth/
├── ui/LoginForm.tsx
├── hooks/useAuth.ts
├── types.ts
└── index.ts

shared/ui/Button/Button.tsx
shared/ui/Icons/
```

## 🔍 Code Review Checklist

### FSD Architecture Review
- [ ] Компоненты в правильных слоях FSD
- [ ] Импорты следуют правилам (нет circular dependencies)
- [ ] Публичные API чистые и документированы
- [ ] Нет нарушений layer boundaries

### Code Quality Review
- [ ] TypeScript типы корректны и строгие
- [ ] Стили изолированы через CSS Modules
- [ ] Логика разделена адекватно между слоями
- [ ] Нет дублирования кода

### Testing Review
- [ ] Добавлены тесты для новой функциональности
- [ ] Существующие тесты не сломаны
- [ ] Тесты покрывают edge cases
- [ ] Тесты следуют FSD структуре

## ⚙️ GitHub Actions для FSD

### Базовый workflow:

```yaml
# .github/workflows/ci.yml
name: FSD CI Pipeline

on: [push, pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npm run type-check
      
      - name: ESLint
        run: npm run lint
      
      - name: Tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build

  fsd-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate FSD structure
        run: |
          # Проверка что все слои существуют
          if [ ! -d "src/shared" ]; then echo "Missing shared layer"; exit 1; fi
          if [ ! -d "src/entities" ]; then echo "Missing entities layer"; exit 1; fi
          if [ ! -d "src/features" ]; then echo "Missing features layer"; exit 1; fi
          if [ ! -d "src/widgets" ]; then echo "Missing widgets layer"; exit 1; fi
          if [ ! -d "src/pages" ]; then echo "Missing pages layer"; exit 1; fi
          
      - name: Check import boundaries
        run: |
          npm install -g madge
          madge --circular --extensions ts,tsx ./src
```

### Auto-assign по FSD слоям:

```yaml
# .github/auto-assign.yml
addReviewers: true
reviewers:
  - fsd-shared-specialist
  - fsd-entities-specialist
  - fsd-features-specialist

filterLabels:
  - 'fsd-shared'
  - 'fsd-entities'
  - 'fsd-features'
  - 'fsd-widgets'
  - 'fsd-pages'

numberOfReviewers: 2
```

## 🏷️ GitHub Labels для FSD

### Создай метки для организации:

```bash
# FSD слои
gh label create "fsd-shared" --description "Shared layer components" --color "BFD4F2"
gh label create "fsd-entities" --description "Entities and data models" --color "D4C5F9"
gh label create "fsd-features" --description "Business features" --color "C9F9C4"
gh label create "fsd-widgets" --description "UI widgets" --color "F9E2C4"
gh label create "fsd-pages" --description "Application pages" --color "F9C4C4"

# Типы задач
gh label create "bug" --description "Something isn't working" --color "d73a4a"
gh label create "enhancement" --description "New feature or request" --color "a2eeef"
gh label create "documentation" --description "Documentation improvements" --color "0075ca"
gh label create "good first issue" --description "Good for newcomers" --color "7057ff"
```

## 📊 GitHub Project Board

### Настройка проекта для FSD:

```yaml
# .github/projects/fsd-workflow.yml
name: "FSD Development Workflow"
columns:
  - "Backlog"
  - "Shared Layer"
  - "Entities Layer" 
  - "Features Layer"
  - "Widgets Layer"
  - "Pages Layer"
  - "Review"
  - "Done"
```

### Автоматизация с GitHub Actions:

```yaml
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, labeled]

jobs:
  automate-project-columns:
    runs-on: ubuntu-latest
    steps:
      - name: Move to Shared Layer
        if: contains(github.event.issue.labels.*.name, 'fsd-shared')
        run: |
          # API call to move issue to Shared Layer column
```

## 🔧 Интеграция с инструментами

### VS Code расширения:

- **GitLens** - enhanced Git capabilities
- **GitHub Pull Requests** - PR management in IDE  
- **Conventional Commits** - commit message helper
- **Error Lens** - inline error display

### CLI инструменты:

```bash
# GitHub CLI
gh auth login
gh repo view
gh pr create
gh issue list

# Commitizen для Conventional Commits
npm install -g commitizen
npm install -g cz-conventional-changelog

# Husky для Git hooks
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"
```

## 🚀 Best Practices

### Для эффективного workflow:

1. **Маленькие PR** - 200-400 строк кода максимум
2. **Один PR = одна фича** - не смешивай несвязанные изменения
3. **Описательные коммиты** - понятные Conventional Commits
4. **Тесты для новой функциональности** - обязательно
5. **Документация обновлений** - особенно для shared компонентов

### Для FSD специфики:

1. **Следуй слоям** - не нарушай иерархию импортов
2. **Проверяй импорты** - используй madge для валидации
3. **Документируй публичные API** - для shared слоя
4. **Тестируй изоляцию** - компоненты должны работать независимо

## 🆘 Решение проблем

### Частые проблемы и решения:

#### PR не проходит проверки:
```bash
# Локально проверь перед PR
npm run type-check
npm run lint  
npm run test
npm run build
```

#### Конфликты при мерже:
```bash
# Обнови ветку
git pull origin develop

# Разреши конфликты
# Протестируй изменения

# Создай новый коммит
git commit -m "fix: resolve merge conflicts"
```

#### GitHub Actions падают:
```bash
# Проверь логи в Actions tab
# Локально воспроизведи проблему
# Исправь и запушь исправление
```

## 📈 Метрики успеха

### Отслеживай через GitHub Insights:
- **Code Frequency** - активность по FSD слоям
- **Pull Requests** - время review, количество comments
- **Issues** - время resolution, распределение по типам
- **Contributors** - активность по командам

Эта конфигурация обеспечит профессиональный GitHub workflow для FSD проектов! 🚀