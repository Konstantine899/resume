# **PHASE 1: UI Kit Components** ⚛️

**Длительность:** 5-7 часов
**Цель:** Создать переиспользуемые компоненты для дизайн-системы

**Статус:** ✅ **ЗАВЕРШЕНО** (18/18 компонентов)

---

## Подплан 1.1: Базовые компоненты (2 часа)

### [x] 1.1.1 `Portal` — рендер вне DOM иерархии

- **Файлы:** `src/shared/ui/Portal/Portal.tsx`
- **Story:** `src/shared/ui/Portal/Portal.stories.tsx` ✅
- **API:** `{ children, containerId?: string }`

### [x] 1.1.2 `Overlay` — затемнение фона

- **Файлы:** `src/shared/ui/Overlay/Overlay.module.scss`
- **Story:** `src/shared/ui/Overlay/Overlay.stories.tsx` ✅
- **API:** `{ opacity?: number, blur?: number, onClick?: () => void }`

### [x] 1.1.3 `Skeleton` — загрузочные состояния

- **Варианты:** `text`, `circular`, `rectangular`
- **Story:** `src/shared/ui/Skeleton/Skeleton.stories.tsx` ✅
- **API:** `{ variant, width?, height?, className? }`

---

## Подплан 1.2: Продвинутые компоненты (2 часа)

### [x] 1.2.1 `Loader` — индикаторы загрузки

- **Варианты:** `spinner`, `dots`, `pulse`
- **Story:** `src/shared/ui/Loader/Loader.stories.tsx` ✅
- **API:** `{ variant?, size?, color?, className? }`
- **Примечание:** Заменяет Spinner из плана

### [x] 1.2.2 `Icon` — типизированные иконки

- **Интеграция:** Lucide React
- **Story:** `src/shared/ui/Icon/Icon.stories.tsx` ✅
- **API:** `{ name, size?, color?, className? }`

### [x] 1.2.3 `Avatar` — с fallback и статусом

- **Story:** `src/shared/ui/Avatar/Avatar.stories.tsx` ✅
- **API:** `{ src?, alt?, fallback?, size?, status? }`

---

## Подплан 1.3: Popups компоненты (2 часа)

### [x] 1.3.1 `Tooltip` — всплывающие подсказки

- **Позиционирование:** `top`, `bottom`, `left`, `right`
- **Story:** `src/shared/ui/Tooltip/Tooltip.stories.tsx` ✅
- **API:** `{ content, position?, children }`

### [x] 1.3.2 `Popover` — кликабельные попапы

- **Story:** `src/shared/ui/Popover/Popover.stories.tsx` ✅
- **API:** `{ trigger, children, content }`

### [x] 1.3.3 `Modal` — обертка для модалок

- **Встроенный:** Portal + Overlay
- **Story:** `src/shared/ui/Modal/Modal.stories.tsx` ✅
- **API:** `{ isOpen, onClose, children, title? }`

---

## Подплан 1.4: Специфичные компоненты (1.5 часа)

### [x] 1.4.1 `Code` — блок кода с подсветкой

- **Интеграция:** Prism.js или highlight.js
- **Story:** `src/shared/ui/Code/Code.stories.tsx` ✅
- **Hook:** `useCopyCode` ✅
- **API:** `{ code, language?, showLineNumbers?, copyButton? }`

### [x] 1.4.2 `Link` — умные ссылки

- **Story:** `src/shared/ui/Link/Link.stories.tsx` ✅
- **Фичи:** External links с иконкой
- **API:** `{ href, variant?, external?, icon?, children }`

---

## Подплан 1.5: Компоненты для форм (1.5 часа)

### [x] 1.5.1 `Label` — подписи к полям формы

- **Story:** `src/shared/ui/Label/Label.stories.tsx` ✅
- **API:** `{ htmlFor, children, className?, required?, error?, success?, description? }`
- **Accessibility:** автоматическая связь с input через `htmlFor`

### [x] 1.5.2 `Input` — поле ввода (дополнительно)

- **Story:** `src/shared/ui/Input/Input.stories.tsx` ✅
- **API:** `{ variant?, size?, label?, error?, success?, icon?, iconAfter?, fullWidth? }`

### [x] 1.5.3 `Textarea` — многострочное поле (дополнительно)

- **Story:** `src/shared/ui/Textarea/Textarea.stories.tsx` ✅
- **API:** `{ rows?, resizable?, error?, success? }`

---

## Подплан 1.6: Дополнительные компоненты (сверх плана)

### [x] 1.6.1 `Button` — расширенная кнопка

- **Story:** `src/shared/ui/Button/Button.stories.tsx` ✅
- **API:** `{ variant?, size?, icon?, iconPosition?, loading?, fullWidth? }`
- **Варианты:** primary, secondary, outline, ghost, danger

### [x] 1.6.2 `Card` — карточка-контейнер

- **Story:** `src/shared/ui/Card/Card.stories.tsx` ✅
- **API:** `{ variant?, padding?, hoverable? }`

### [x] 1.6.3 `Toast` — уведомления

- **Story:** `src/shared/ui/Toast/Toast.stories.tsx` ✅
- **API:** `{ type?, duration?, onClose? }`
- **Типы:** success, error, info, warning

### [x] 1.6.4 `AnimatedSection` — анимационный wrapper

- **Story:** `src/shared/ui/AnimatedSection/AnimatedSection.stories.tsx` ✅
- **API:** `{ animation?, delay?, threshold? }`

---

## ❌ Исключено из плана

### Checkbox

- **Статус:** Не требуется по согласованию

### Spinner

- **Статус:** Не требуется — функциональность покрыта `Loader` с variant="spinner"

---

## ✅ Acceptance Criteria Phase 1

- [x] Все 14 компонентов созданы ✅
- [x] Каждый компонент имеет `.module.scss` стили ✅
- [x] Каждый компонент имеет TypeScript типы ✅
- [x] Экспорты через `index.ts` для каждого компонента ✅
- [x] Stories для всех 18 компонентов ✅
- [x] Label интегрирован с Input и Textarea ✅

---

## 📝 Checklist

```
[x] 1.1.1 Portal component
[x] 1.1.2 Overlay component
[x] 1.1.3 Skeleton component
[x] 1.2.1 Loader component
[x] 1.2.2 Icon component
[x] 1.2.3 Avatar component
[x] 1.3.1 Tooltip component
[x] 1.3.2 Popover component
[x] 1.3.3 Modal component
[x] 1.4.1 Code component
[x] 1.4.2 Link component
[x] 1.5.1 Label component
[x] 1.5.2 Input component (дополнительно)
[x] 1.5.3 Textarea component (дополнительно)
[x] 1.6.1 Button component (дополнительно)
[x] 1.6.2 Card component (дополнительно)
[x] 1.6.3 Toast component (дополнительно)
[x] 1.6.4 AnimatedSection component (дополнительно)
[-] 1.5.2 Checkbox component (не требуется)
[-] 1.5.3 Spinner component (не требуется, покрыт Loader)
```

**Всего:** 18 компонентов создано (14 по плану + 4 дополнительно)
**Статус:** ✅ **ЗАВЕРШЕНО**

---

## 📊 Итоговая статистика

| Категория        | Количество            |
| ---------------- | --------------------- |
| По плану         | 14                    |
| Дополнительно    | 4                     |
| Исключено        | 2 (Checkbox, Spinner) |
| **Создано**      | **18**                |
| **Stories**      | **18/18 (100%)**      |
| **TypeScript**   | **18/18 (100%)**      |
| **SCSS Modules** | **18/18 (100%)**      |

````

---

## 📄 Файл 2: `docs/upgrade/phase-2-storybook.md`

```markdown
# **PHASE 2: Storybook** 📖

**Длительность:** 3-4 часа
**Цель:** Документирование компонентов и визуальное тестирование

**Статус:** ✅ **ЗАВЕРШЕНО** (18/18 stories)

---

## Подплан 2.1: Настройка Storybook (1.5 часа)

### [x] 2.1.1 Установка зависимостей

```bash
npm install -D storybook @storybook/react @storybook/addon-essentials
````

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
