---
description: Валидация FSD архитектуры с проверкой импортов между слоями
---

# Validate FSD Architecture

Запускает полную валидацию FSD архитектуры проекта.

## Что проверяет

1. **Layer Dependencies** - импорты между слоями
2. **Circular Dependencies** - циклические зависимости
3. **Public API** - наличие index.ts файлов
4. **File Placement** - правильное расположение файлов

## Использование

```bash
/validate-fsd
```

## Опции

- `--strict` - строгий режим с ошибками
- `--fix` - автоматическое исправление
- `--report` - детальный отчет

## Примеры

```bash
# Базовая валидация
/validate-fsd

# Валидация с исправлениями
/validate-fsd --fix

# Валидация конкретного слоя
/validate-fsd entities/user
```

## Quality Gates

- ✅ Zero circular dependencies
- ✅ 100% layer compliance
- ✅ Clean public APIs
- ✅ Proper file placement
