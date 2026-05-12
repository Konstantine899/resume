# **PHASE 4: Redux Toolkit** 🗂️

**Длительность:** 6-8 часов
**Цель:** Управление глобальным состоянием и данными

---

## Подплан 4.1: Базовая настройка (1 час)

### [ ] 4.1.1 Установка зависимостей

```bash
npm install @reduxjs/toolkit react-redux
```

### [ ] 4.1.2 Создание `src/app/store.ts`

- configureStore
- Middleware настройка
- DevTools

### [ ] 4.1.3 Создание typed hooks

- `useAppDispatch`
- `useAppSelector`

### [ ] 4.1.4 Интеграция Provider

- `src/app/providers/StoreProvider.tsx`
- Обертка в `App.tsx`

---

## Подплан 4.2: UI Slice (1.5 часа)

### [ ] 4.2.1 Создание `src/features/ui/model/uiSlice.ts`

- Sidebar состояние (isOpen, isHoverExpanded)
- Mobile Menu состояние (isOpen)
- Modals состояние

### [ ] 4.2.2 Actions и reducers

- `toggleSidebar`, `setSidebarOpen`
- `toggleMobileMenu`, `closeMobileMenu`
- `openModal`, `closeModal`

### [ ] 4.2.3 Миграция Sidebar

- Замена `useSidebar` на Redux
- Обновление `widgets/Sidebar`

### [ ] 4.2.4 Миграция MobileMenu

- Интеграция с Redux state
- Синхронизация с desktop sidebar

---

## Подплан 4.3: RTK Query для Projects (2 часа)

### [ ] 4.3.1 Создание API slice

- `src/entities/project/api/projectsApi.ts`
- `createApi` конфигурация
- Endpoints: `getProjects`, `getProjectById`

### [ ] 4.3.2 Mock API (если нет бэкенда)

- `src/entities/project/api/mockData.ts`
- MSW (Mock Service Worker) настройка

### [ ] 4.3.3 Миграция MyWork feature

- Замена локального state на `useGetProjectsQuery`
- Loading states с Skeleton
- Error handling

### [ ] 4.3.4 Кэширование и invalidation

- Tag types настройка
- `providesTags`, `invalidatesTags`

---

## Подплан 4.4: RTK Query для Contact (1.5 часа)

### [ ] 4.4.1 Создание API slice

- `src/features/contact/api/contactApi.ts`
- Endpoint: `sendContactForm`

### [ ] 4.4.2 Retry logic

- Exponential backoff
- Max retries конфигурация

### [ ] 4.4.3 Интеграция с Toast

- Success уведомления
- Error уведомления

### [ ] 4.4.4 Optimistic updates

- `onQueryStarted` для оптимистичного UI

---

## Подплан 4.5: Developer Data Slice (1 час)

### [ ] 4.5.1 Создание `src/entities/developer/model/developerSlice.ts`

- Hero данные (fullName, profession, etc.)
- localStorage персистентность
- Actions: `updateDeveloperData`, `resetDeveloperData`

### [ ] 4.5.2 Интеграция в Hero component

- Чтение данных из Redux
- Реактивное обновление

---

## ✅ Acceptance Criteria Phase 4

- [ ] Store настроен и работает
- [ ] Redux DevTools показывает все state
- [ ] UI Slice управляет Sidebar/MobileMenu
- [ ] Projects загружаются через RTK Query
- [ ] Contact форма использует RTK Query
- [ ] Developer данные редактируемые
- [ ] 0 TypeScript ошибок

---

## 📝 Checklist

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

**Всего:** 18 задач
