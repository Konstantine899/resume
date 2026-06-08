---
description: Code review для React + TypeScript + FSD с проверками архитектуры и стиля
---

# Code Review

Проводит полный code review файла или директории.

## Что проверяет

1. **FSD Architecture** - layer dependencies, file placement
2. **TypeScript** - type safety, no any, strict mode
3. **React** - hooks, memoization, error handling
4. **Code Style** - naming, formatting, organization
5. **Security** - no secrets, validated inputs
6. **Performance** - memoization, no leaks
7. **Testing** - coverage, test quality
8. **Accessibility** - ARIA, keyboard nav, semantic HTML

## Использование

```bash
/code-review <file-or-path>
```

## Примеры

```bash
# Review конкретного файла
/code-review src/entities/user/ui/UserCard/UserCard.tsx

# Review директории
/code-review src/features/auth

# Review с исправлениями
/code-review src/shared/ui --fix
```

## Report Format

```markdown
🔴 [CRITICAL] - блокирующие проблемы
🟡 [WARNING] - важные замечания
🔵 [SUGGESTION] - рекомендации по улучшению
```

## Quality Gates

- ✅ Zero critical issues
- ✅ Type coverage 100%
- ✅ No FSD violations
- ✅ All tests passing
