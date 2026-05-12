# **PHASE 2: Storybook** 📖

**Длительность:** 3-4 часа
**Цель:** Документирование компонентов и визуальное тестирование

**Статус:** ✅ **ЗАВЕРШЕНО** (18/18 stories)

---

## Подплан 2.1: Настройка Storybook (1.5 часа)

### [x] 2.1.1 Установка зависимостей

```bash
npm install -D storybook @storybook/react @storybook/addon-essentials
```

### [x] 2.1.2 Инициализация Storybook

```bash
npx storybook@latest init
```

### [x] 2.1.3 Настройка `.storybook/main.ts`

- [x] Webpack/Vite конфигурация
- [x] Aliases для FSD импортов

### [x] 2.1.4 Настройка `.storybook/preview.tsx`

- [x] Глобальные декораторы (ThemeProvider, I18nProvider)
- [x] Глобальные стили

---

## Подплан 2.2: Stories для компонентов (1.5 часа)

### ✅ Все 18 компонентов имеют stories

#### Базовые компоненты (3)

- [x] Portal — `src/shared/ui/Portal/Portal.stories.tsx`
- [x] Overlay — `src/shared/ui/Overlay/Overlay.stories.tsx`
- [x] Skeleton — `src/shared/ui/Skeleton/Skeleton.stories.tsx`

#### Продвинутые компоненты (3)

- [x] Loader — `src/shared/ui/Loader/Loader.stories.tsx`
- [x] Icon — `src/shared/ui/Icon/Icon.stories.tsx`
- [x] Avatar — `src/shared/ui/Avatar/Avatar.stories.tsx`

#### Popups компоненты (3)

- [x] Tooltip — `src/shared/ui/Tooltip/Tooltip.stories.tsx`
- [x] Popover — `src/shared/ui/Popover/Popover.stories.tsx`
- [x] Modal — `src/shared/ui/Modal/Modal.stories.tsx`

#### Специфичные компоненты (2)

- [x] Code — `src/shared/ui/Code/Code.stories.tsx`
- [x] Link — `src/shared/ui/Link/Link.stories.tsx`

#### Компоненты для форм (3)

- [x] Label — `src/shared/ui/Label/Label.stories.tsx`
- [x] Input — `src/shared/ui/Input/Input.stories.tsx`
- [x] Textarea — `src/shared/ui/Textarea/Textarea.stories.tsx`

#### Дополнительные компоненты (4)

- [x] Button — `src/shared/ui/Button/Button.stories.tsx`
- [x] Card — `src/shared/ui/Card/Card.stories.tsx`
- [x] Toast — `src/shared/ui/Toast/Toast.stories.tsx`
- [x] AnimatedSection — `src/shared/ui/AnimatedSection/AnimatedSection.stories.tsx`

### [x] 2.2.3 Документация в stories

- [x] `parameters.docs.description`
- [x] `argTypes` для контроля пропсов
- [x] Примеры использования

---

## Подплан 2.3: Аддоны и улучшения (1 час)

### [x] 2.3.1 Storybook addons

- [x] `@storybook/addon-a11y` — accessibility тесты
- [x] `@storybook/addon-interactions` — интерактивные тесты
- [x] `@storybook/addon-docs` — авто-документация

### [x] 2.3.2 Настройка npm скриптов

```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

### [ ] 2.3.3 Деплой Storybook на Netlify

- [ ] Отдельный subdomain: `storybook.your-portfolio.com`

---

## ✅ Acceptance Criteria Phase 2

- [x] Storybook запускается без ошибок ✅
- [x] Все 18 компонентов имеют stories ✅
- [x] Декораторы работают (Theme, I18n) ✅
- [ ] Addon-a11y не показывает критических ошибок (требуется проверка)
- [ ] Storybook собран и задеплоен (требуется деплой)

---

## 📝 Checklist

```
[x] 2.1.1 Install Storybook dependencies
[x] 2.1.2 Initialize Storybook
[x] 2.1.3 Configure main.ts
[x] 2.1.4 Configure preview.tsx
[x] 2.2.1 Button stories
[x] 2.2.2 All UI Kit stories (18/18)
[x] 2.2.3 Documentation in stories
[x] 2.3.1 Install addons (a11y, interactions, docs)
[x] 2.3.2 Configure npm scripts
[ ] 2.3.3 Deploy to Netlify
```

**Всего:** 10 задач (9 выполнено, 1 ожидается)
**Статус:** ✅ **ЗАВЕРШЕНО НА 90%**

---

## 📊 Stories статистика

| Категория      | Компонентов | Stories   |
| -------------- | ----------- | --------- |
| Базовые        | 3           | ✅ 3      |
| Продвинутые    | 3           | ✅ 3      |
| Popups         | 3           | ✅ 3      |
| Специфичные    | 2           | ✅ 2      |
| Формы          | 3           | ✅ 3      |
| Дополнительные | 4           | ✅ 4      |
| **Итого**      | **18**      | **✅ 18** |

---

## 📁 Структура stories

Все stories находятся в папках компонентов:

```
src/shared/ui/
├── Button/ui/Button.stories.tsx
├── Modal/ui/Modal.stories.tsx
├── Toast/ui/Toast.stories.tsx
├── Label/ui/Label.stories.tsx
├── Input/ui/Input.stories.tsx
├── Textarea/ui/Textarea.stories.tsx
├── Card/ui/Card.stories.tsx
├── Code/ui/Code.stories.tsx
├── Icon/ui/Icon.stories.tsx
├── Link/ui/Link.stories.tsx
├── Loader/ui/Loader.stories.tsx
├── Avatar/ui/Avatar.stories.tsx
├── Tooltip/ui/Tooltip.stories.tsx
├── Popover/ui/Popover.stories.tsx
├── Portal/ui/Portal.stories.tsx
├── Overlay/ui/Overlay.stories.tsx
├── Skeleton/ui/Skeleton.stories.tsx
└── AnimatedSection/ui/AnimatedSection.stories.tsx
```

---

## 🎯 Следующие шаги

1. **Проверить accessibility** — запустить addon-a11y для всех компонентов
2. **Собрать Storybook** — `npm run build-storybook`
3. **Задеплоить на Netlify** — настроить отдельный subdomain
