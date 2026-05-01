# 📋 Portfolio Middle+ Upgrade Plan

**Проект:** Maximus Dayton Portfolio  
**Цель:** Превратить портфолио в production-ready проект Middle+ уровня  
**Общее время:** ~20-28 часов работы  
**Технологии:** Redux Toolkit, Storybook, React Testing Library, TypeScript, SASS

---

## 📊 Общая структура

```
Phase 1: UI Kit Components     (4-6 часов)
Phase 2: Storybook             (3-4 часа)
Phase 3: React Testing Library (4-6 часов)
Phase 4: Redux Toolkit         (6-8 часов)
Phase 5: Admin Mode            (3-4 часа)
─────────────────────────────────────────
Итого: ~20-28 часов работы
```

---

## **PHASE 1: UI Kit Components** ⚛️

**Длительность:** 4-6 часов  
**Цель:** Создать переиспользуемые компоненты для дизайн-системы

### Подплан 1.1: Базовые компоненты (2 часа)

- [ ] **1.1.1** `Portal` — рендер вне DOM иерархии
  - Файлы: `src/shared/ui/Portal/Portal.tsx`
  - Тесты: `src/shared/ui/Portal/Portal.test.tsx`
  - Story: `src/shared/ui/Portal/Portal.stories.tsx`
  - API: `{ children, containerId?: string }`

- [ ] **1.1.2** `Overlay` — затемнение фона
  - Файлы: `src/shared/ui/Overlay/Overlay.module.scss`
  - API: `{ opacity?: number, blur?: number, onClick?: () => void }`

- [ ] **1.1.3** `Skeleton` — загрузочные состояния
  - Варианты: `text`, `circular`, `rectangular`
  - API: `{ variant, width?, height?, className? }`

### Подплан 1.2: Продвинутые компоненты (2 часа)

- [ ] **1.2.1** `Loader` — индикаторы загрузки
  - Варианты: `spinner`, `dots`, `pulse`
  - API: `{ variant?, size?, className? }`

- [ ] **1.2.2** `Icon` — типизированные иконки
  - Интеграция с Lucide React
  - API: `{ name, size?, color?, className? }`

- [ ] **1.2.3** `Avatar` — с fallback и статусом
  - API: `{ src?, alt?, fallback?, size?, status? }`

### Подплан 1.3: Popups компоненты (2 часа)

- [ ] **1.3.1** `Tooltip` — всплывающие подсказки
  - Позиционирование: `top`, `bottom`, `left`, `right`
  - API: `{ content, position?, children }`

- [ ] **1.3.2** `Popover` — кликабельные попапы
  - API: `{ trigger, children, content }`

- [ ] **1.3.3** `Modal` — обертка для модалок
  - Встроенный Portal + Overlay
  - API: `{ isOpen, onClose, children, title? }`

### Подплан 1.4: Специфичные компоненты (1 час)

- [ ] **1.4.1** `Code` — блок кода с подсветкой
  - Интеграция с Prism.js или highlight.js
  - API: `{ code, language?, showLineNumbers?, copyButton? }`

- [ ] **1.4.2** `Link` — умные ссылки
  - External links с иконкой
  - API: `{ href, variant?, external?, icon?, children }`

### ✅ Acceptance Criteria Phase 1:

- [ ] Все 11 компонентов созданы
- [ ] Каждый компонент имеет `.module.scss` стили
- [ ] Каждый компонент имеет TypeScript типы
- [ ] Экспорты через `index.ts` для каждого компонента
- [ ] Документация в README для каждого компонента

---

## **PHASE 2: Storybook** 📖

**Длительность:** 3-4 часа  
**Цель:** Документирование компонентов и визуальное тестирование

### Подплан 2.1: Настройка Storybook (1.5 часа)

- [ ] **2.1.1** Установка зависимостей

  ```bash
  npm install -D storybook @storybook/react @storybook/addon-essentials
  ```

- [ ] **2.1.2** Инициализация Storybook

  ```bash
  npx storybook@latest init
  ```

- [ ] **2.1.3** Настройка `.storybook/main.ts`
  - Webpack/Vite конфигурация
  - Aliases для FSD импортов

- [ ] **2.1.4** Настройка `.storybook/preview.tsx`
  - Глобальные декораторы (ThemeProvider, I18nProvider)
  - Глобальные стили

### Подплан 2.2: Stories для компонентов (1.5 часа)

- [ ] **2.2.1** Button stories (пример для остальных)
  - Basic variants
  - With icons
  - Loading states
  - Disabled states

- [ ] **2.2.2** Stories для всех UI Kit компонентов
  - Portal, Overlay, Skeleton, Loader, Icon, Avatar
  - Tooltip, Popover, Modal
  - Code, Link

- [ ] **2.2.3** Документация в stories
  - `parameters.docs.description`
  - `argTypes` для контроля пропсов
  - Примеры использования

### Подплан 2.3: Аддоны и улучшения (1 час)

- [ ] **2.3.1** Storybook addons
  - `@storybook/addon-a11y` — accessibility тесты
  - `@storybook/addon-interactions` — интерактивные тесты
  - `@storybook/addon-docs` — авто-документация

- [ ] **2.3.2** Настройка npm скриптов

  ```json
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
  ```

- [ ] **2.3.3** Деплой Storybook на Netlify
  - Отдельный subdomain: `storybook.your-portfolio.com`

### ✅ Acceptance Criteria Phase 2:

- [ ] Storybook запускается без ошибок
- [ ] Все 11 компонентов имеют stories
- [ ] Декораторы работают (Theme, I18n)
- [ ] Addon-a11y не показывает критических ошибок
- [ ] Storybook собран и задеплоен

---

## **PHASE 3: React Testing Library** 🧪

**Длительность:** 4-6 часов  
**Цель:** Покрытие тестами критических компонентов

### Подплан 3.1: Настройка тестирования (1 час)

- [ ] **3.1.1** Установка зависимостей

  ```bash
  npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
  ```

- [ ] **3.1.2** Настройка Vite для тестов
  - `vite.config.ts` test configuration
  - Setup file для testing-library

- [ ] **3.1.3** Создание `src/test-utils.tsx`
  - Custom `render` с провайдерами
  - Custom `screen` экспорты

- [ ] **3.1.4** Настройка npm скриптов
  ```json
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
  ```

### Подплан 3.2: Unit тесты для Shared UI (2 часа)

- [ ] **3.2.1** Button тесты
  - Рендер с children
  - onClick handler
  - Disabled state
  - Loading state
  - Accessibility (role, aria-\*)

- [ ] **3.2.2** Input тесты
  - Value changes
  - Error states
  - Disabled state
  - Label association

- [ ] **3.2.3** Skeleton/Loader тесты
  - Рендер всех вариантов
  - Accessibility (aria-busy)

### Подплан 3.3: Integration тесты для Features (2 часа)

- [ ] **3.3.1** Contact Form тесты
  - Заполнение формы
  - Валидация полей
  - Отправка (mock API)
  - Успешный ответ
  - Ошибка отправки

- [ ] **3.3.2** ThemeSwitch тесты
  - Переключение темы
  - Сохранение в localStorage
  - Системные предпочтения

- [ ] **3.3.3** LanguageSwitch тесты
  - Переключение языка
  - Переводы применяются

### Подплан 3.4: Accessibility тесты (1 час)

- [ ] **3.4.1** axe-core интеграция

  ```bash
  npm install -D @axe-core/react
  ```

- [ ] **3.4.2** A11y тесты для компонентов
  - Keyboard navigation
  - Screen reader support
  - Color contrast

- [ ] **3.4.3** CI интеграция
  - Запуск a11y тестов в GitHub Actions

### ✅ Acceptance Criteria Phase 3:

- [ ] Vitest настроен и работает
- [ ] 15+ unit тестов для Shared UI
- [ ] 5+ integration тестов для Features
- [ ] Coverage > 70% для критических компонентов
- [ ] 0 критических a11y ошибок
- [ ] Тесты запускаются в CI

---

## **PHASE 4: Redux Toolkit** 🗂️

**Длительность:** 6-8 часов  
**Цель:** Управление глобальным состоянием и данными

### Подплан 4.1: Базовая настройка (1 час)

- [ ] **4.1.1** Установка зависимостей

  ```bash
  npm install @reduxjs/toolkit react-redux
  ```

- [ ] **4.1.2** Создание `src/app/store.ts`
  - configureStore
  - Middleware настройка
  - DevTools

- [ ] **4.1.3** Создание typed hooks
  - `useAppDispatch`
  - `useAppSelector`

- [ ] **4.1.4** Интеграция Provider
  - `src/app/providers/StoreProvider.tsx`
  - Обертка в `App.tsx`

### Подплан 4.2: UI Slice (1.5 часа)

- [ ] **4.2.1** Создание `src/features/ui/model/uiSlice.ts`
  - Sidebar состояние (isOpen, isHoverExpanded)
  - Mobile Menu состояние (isOpen)
  - Modals состояние

- [ ] **4.2.2** Actions и reducers
  - `toggleSidebar`, `setSidebarOpen`
  - `toggleMobileMenu`, `closeMobileMenu`
  - `openModal`, `closeModal`

- [ ] **4.2.3** Миграция Sidebar
  - Замена `useSidebar` на Redux
  - Обновление `widgets/Sidebar`

- [ ] **4.2.4** Миграция MobileMenu
  - Интеграция с Redux state
  - Синхронизация с desktop sidebar

### Подплан 4.3: RTK Query для Projects (2 часа)

- [ ] **4.3.1** Создание API slice
  - `src/entities/project/api/projectsApi.ts`
  - `createApi` конфигурация
  - Endpoints: `getProjects`, `getProjectById`

- [ ] **4.3.2** Mock API (если нет бэкенда)
  - `src/entities/project/api/mockData.ts`
  - MSW (Mock Service Worker) настройка

- [ ] **4.3.3** Миграция MyWork feature
  - Замена локального state на `useGetProjectsQuery`
  - Loading states с Skeleton
  - Error handling

- [ ] **4.3.4** Кэширование и invalidation
  - Tag types настройка
  - `providesTags`, `invalidatesTags`

### Подплан 4.4: RTK Query для Contact (1.5 часа)

- [ ] **4.4.1** Создание API slice
  - `src/features/contact/api/contactApi.ts`
  - Endpoint: `sendContactForm`

- [ ] **4.4.2** Retry logic
  - Exponential backoff
  - Max retries конфигурация

- [ ] **4.4.3** Интеграция с Toast
  - Success уведомления
  - Error уведомления

- [ ] **4.4.4** Optimistic updates
  - `onQueryStarted` для оптимистичного UI

### Подплан 4.5: Developer Data Slice (1 час)

- [ ] **4.5.1** Создание `src/entities/developer/model/developerSlice.ts`
  - Hero данные (fullName, profession, etc.)
  - localStorage персистентность
  - Actions: `updateDeveloperData`, `resetDeveloperData`

- [ ] **4.5.2** Интеграция в Hero component
  - Чтение данных из Redux
  - Реактивное обновление

### ✅ Acceptance Criteria Phase 4:

- [ ] Store настроен и работает
- [ ] Redux DevTools показывает все state
- [ ] UI Slice управляет Sidebar/MobileMenu
- [ ] Projects загружаются через RTK Query
- [ ] Contact форма использует RTK Query
- [ ] Developer данные редактируемые
- [ ] 0 TypeScript ошибок

---

## **PHASE 5: Admin Mode** 👨‍💻

**Длительность:** 3-4 часа  
**Цель:** Режим редактирования контента портфолио

### Подплан 5.1: Admin Slice (30 мин)

- [ ] **5.1.1** Создание `src/features/admin/model/adminSlice.ts`
  - `isAdminMode` state
  - `isEditModalOpen` state
  - `editingSection` state
  - localStorage персистентность

- [ ] **5.1.2** Actions
  - `toggleAdminMode`
  - `setAdminMode`
  - `openEditModal`, `closeEditModal`

### Подплан 5.2: Admin Toggle Button (30 мин)

- [ ] **5.2.1** Создание компонента
  - `src/features/admin/ui/AdminToggleButton/AdminToggleButton.tsx`
  - Интеграция в Sidebar

- [ ] **5.2.2** Визуальные состояния
  - Active/inactive стили
  - Tooltip с инструкцией

### Подплан 5.3: Edit Hero Modal (2 часа)

- [ ] **5.3.1** Создание модалки
  - `src/features/admin/ui/EditHeroModal/EditHeroModal.tsx`
  - Интеграция с Portal + Overlay

- [ ] **5.3.2** Форма редактирования
  - `src/features/admin/ui/EditHeroModal/EditHeroForm.tsx`
  - React Hook Form + Zod валидация
  - Поля: fullName, profession, specialties, skillsLabel, yearsOfExperience, age

- [ ] **5.3.3** Интеграция с Redux
  - Чтение текущих данных
  - Отправка изменений
  - Reset к исходным значениям

- [ ] **5.3.4** UX улучшения
  - Loading state при сохранении
  - Success/Error уведомления
  - Закрытие по Escape/Overlay

### Подплан 5.4: Visual Indicators (30 мин)

- [ ] **5.4.1** Границы у секций
  - CSS outline в admin mode
  - Анимация появления

- [ ] **5.4.2** Edit кнопки на секциях
  - Hero, MyWork, About, Skills, Contact
  - Иконка Pencil

- [ ] **5.4.3** Admin Mode Indicator
  - Бейдж в углу экрана
  - Только в active режиме

### ✅ Acceptance Criteria Phase 5:

- [ ] Admin toggle работает
- [ ] Состояние сохраняется в localStorage
- [ ] Edit модалка открывается/закрывается
- [ ] Данные редактируются и сохраняются
- [ ] Визуальные индикаторы работают
- [ ] Валидация формы работает

---

# 📊 Redux Architecture

## Store Structure

```typescript
// src/app/store.ts
export const store = configureStore({
  reducer: {
    // UI состояние
    ui: uiReducer,

    // Admin режим
    admin: adminReducer,

    // Данные разработчика
    developer: developerReducer,

    // RTK Query APIs
    [projectsApi.reducerPath]: projectsApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectsApi.middleware).concat(contactApi.middleware),
});
```

## Slices

1. **uiSlice** - Sidebar, MobileMenu, Modals
2. **adminSlice** - Admin mode, Edit modal state
3. **developerSlice** - Hero data (fullName, profession, etc.)
4. **projectsApi** - RTK Query for projects
5. **contactApi** - RTK Query for contact form

## Hooks

```typescript
// src/app/store/hooks.ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

# 📝 Complete TODO Checklist

## Phase 1: UI Kit Components (11 tasks)

```
[ ] 1.1.1 Portal component
[ ] 1.1.2 Overlay component
[ ] 1.1.3 Skeleton component
[ ] 1.2.1 Loader component
[ ] 1.2.2 Icon component
[ ] 1.2.3 Avatar component
[ ] 1.3.1 Tooltip component
[ ] 1.3.2 Popover component
[ ] 1.3.3 Modal component
[ ] 1.4.1 Code component
[ ] 1.4.2 Link component
```

## Phase 2: Storybook (10 tasks)

```
[ ] 2.1.1 Install Storybook dependencies
[ ] 2.1.2 Initialize Storybook
[ ] 2.1.3 Configure main.ts
[ ] 2.1.4 Configure preview.tsx
[ ] 2.2.1 Button stories
[ ] 2.2.2 All UI Kit stories
[ ] 2.2.3 Documentation in stories
[ ] 2.3.1 Install addons (a11y, interactions, docs)
[ ] 2.3.2 Configure npm scripts
[ ] 2.3.3 Deploy to Netlify
```

## Phase 3: React Testing Library (14 tasks)

```
[ ] 3.1.1 Install testing dependencies
[ ] 3.1.2 Configure Vite for tests
[ ] 3.1.3 Create test-utils.tsx
[ ] 3.1.4 Configure npm scripts
[ ] 3.2.1 Button tests
[ ] 3.2.2 Input tests
[ ] 3.2.3 Skeleton/Loader tests
[ ] 3.3.1 Contact Form tests
[ ] 3.3.2 ThemeSwitch tests
[ ] 3.3.3 LanguageSwitch tests
[ ] 3.4.1 Install axe-core
[ ] 3.4.2 A11y tests for components
[ ] 3.4.3 CI integration
```

## Phase 4: Redux Toolkit (17 tasks)

```
[ ] 4.1.1 Install Redux dependencies
[ ] 4.1.2 Create store.ts
[ ] 4.1.3 Create typed hooks
[ ] 4.1.4 Create StoreProvider
[ ] 4.2.1 Create uiSlice
[ ] 4.2.2 Create actions/reducers
[ ] 4.2.3 Migrate Sidebar to Redux
[ ] 4.2.4 Migrate MobileMenu to Redux
[ ] 4.3.1 Create projectsApi
[ ] 4.3.2 Setup Mock API
[ ] 4.3.3 Migrate MyWork feature
[ ] 4.3.4 Configure caching/invalidation
[ ] 4.4.1 Create contactApi
[ ] 4.4.2 Implement retry logic
[ ] 4.4.3 Integrate with Toast
[ ] 4.4.4 Optimistic updates
[ ] 4.5.1 Create developerSlice
[ ] 4.5.2 Integrate in Hero component
```

## Phase 5: Admin Mode (9 tasks)

```
[ ] 5.1.1 Create adminSlice
[ ] 5.1.2 Create actions
[ ] 5.2.1 Create AdminToggleButton
[ ] 5.2.2 Add visual states
[ ] 5.3.1 Create EditHeroModal
[ ] 5.3.2 Create EditHeroForm
[ ] 5.3.3 Integrate with Redux
[ ] 5.3.4 UX improvements
[ ] 5.4.1 Section borders in admin mode
[ ] 5.4.2 Edit buttons on sections
[ ] 5.4.3 Admin Mode Indicator
```

**Total: 61 individual tasks across 5 phases**

---

# 📈 Progress Tracking

```
Phase 1: UI Kit           [          ] 0%
Phase 2: Storybook        [          ] 0%
Phase 3: Testing          [          ] 0%
Phase 4: Redux            [          ] 0%
Phase 5: Admin Mode       [          ] 0%
─────────────────────────────────────
Total Progress            [          ] 0%
```

---

# 🚀 Getting Started

## Начать с Phase 1.1:

```bash
# 1. Создать директорию для Portal
mkdir -p src/shared/ui/Portal

# 2. Создать файлы компонента
touch src/shared/ui/Portal/Portal.tsx
touch src/shared/ui/Portal/Portal.module.scss
touch src/shared/ui/Portal/types.ts
touch src/shared/ui/Portal/index.ts

# 3. Начать реализацию!
```

## Ресурсы:

- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Storybook**: https://storybook.js.org/
- **Testing Library**: https://testing-library.com/
- **RTK Query**: https://redux-toolkit.js.org/rtk-query/overview

---

**Last Updated:** 2025-10-20  
**Status:** Planning Complete, Ready for Implementation
