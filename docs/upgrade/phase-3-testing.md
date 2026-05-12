# **PHASE 3: React Testing Library** 🧪

**Длительность:** 4-6 часов
**Цель:** Покрытие тестами критических компонентов

---

## Подплан 3.1: Настройка тестирования (1 час)

### [ ] 3.1.1 Установка зависимостей

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### [ ] 3.1.2 Настройка Vite для тестов

- `vite.config.ts` test configuration
- Setup file для testing-library

### [ ] 3.1.3 Создание `src/test-utils.tsx`

- Custom `render` с провайдерами
- Custom `screen` экспорты

### [ ] 3.1.4 Настройка npm скриптов

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

---

## Подплан 3.2: Unit тесты для Shared UI (2 часа)

### [ ] 3.2.1 Button тесты

- Рендер с children
- onClick handler
- Disabled state
- Loading state
- Accessibility (role, aria-\*)

### [ ] 3.2.2 Input тесты

- Value changes
- Error states
- Disabled state
- Label association

### [ ] 3.2.3 Label тесты

- Рендер с htmlFor
- Required индикатор
- Error state
- Accessibility (aria-describedby)

### [ ] 3.2.4 Skeleton/Loader тесты

- Рендер всех вариантов
- Accessibility (aria-busy)

---

## Подплан 3.3: Integration тесты для Features (2 часа)

### [ ] 3.3.1 Contact Form тесты

- Заполнение формы
- Валидация полей
- Отправка (mock API)
- Успешный ответ
- Ошибка отправки

### [ ] 3.3.2 ThemeSwitch тесты

- Переключение темы
- Сохранение в localStorage
- Системные предпочтения

### [ ] 3.3.3 LanguageSwitch тесты

- Переключение языка
- Переводы применяются

---

## Подплан 3.4: Accessibility тесты (1 час)

### [ ] 3.4.1 axe-core интеграция

```bash
npm install -D @axe-core/react
```

### [ ] 3.4.2 A11y тесты для компонентов

- Keyboard navigation
- Screen reader support
- Color contrast
- Label-Input association

### [ ] 3.4.3 CI интеграция

- Запуск a11y тестов в GitHub Actions

---

## ✅ Acceptance Criteria Phase 3

- [ ] Vitest настроен и работает
- [ ] 18+ unit тестов для Shared UI
- [ ] 5+ integration тестов для Features
- [ ] Coverage > 70% для критических компонентов
- [ ] 0 критических a11y ошибок
- [ ] Тесты запускаются в CI

---

## 📝 Checklist

```
[ ] 3.1.1 Install testing dependencies
[ ] 3.1.2 Configure Vite for tests
[ ] 3.1.3 Create test-utils.tsx
[ ] 3.1.4 Configure npm scripts
[ ] 3.2.1 Button tests
[ ] 3.2.2 Input tests
[ ] 3.2.3 Label tests
[ ] 3.2.4 Skeleton/Loader tests
[ ] 3.3.1 Contact Form tests
[ ] 3.3.2 ThemeSwitch tests
[ ] 3.3.3 LanguageSwitch tests
[ ] 3.4.1 Install axe-core
[ ] 3.4.2 A11y tests for components
[ ] 3.4.3 CI integration
```

**Всего:** 14 задач
