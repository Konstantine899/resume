---
description: Запуск тестов с coverage для конкретного компонента или всего проекта
---

# Run Tests

Запускает Vitest тесты с различными опциями.

## Использование

```bash
/run-tests [path] [options]
```

## Опции

- `--coverage` - собрать coverage report
- `--watch` - watch mode
- `--ui` - открыть UI
- `--reporter=verbose` - детальный отчет

## Примеры

```bash
# Запустить все тесты
/run-tests

# Запустить тесты компонента
/run-tests shared/ui/Button

# Запустить с coverage
/run-tests --coverage

# Запустить в watch mode
/run-tests --watch
```

## Coverage Requirements

| Тип | Требование |
|-----|------------|
| Lines | > 90% |
| Branches | > 85% |
| Functions | > 95% |
| Statements | > 90% |

## Quality Gates

- ✅ Все тесты проходят
- ✅ Coverage выше порога
- ✅ Нет flaky tests
- ✅ Performance budgets met
