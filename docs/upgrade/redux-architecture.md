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

---

## Slices Overview

| Slice              | Путь                                         | Описание                               |
| ------------------ | -------------------------------------------- | -------------------------------------- |
| **uiSlice**        | `features/ui/model/uiSlice.ts`               | Sidebar, MobileMenu, Modals            |
| **adminSlice**     | `features/admin/model/adminSlice.ts`         | Admin mode, Edit modal state           |
| **developerSlice** | `entities/developer/model/developerSlice.ts` | Hero data (fullName, profession, etc.) |
| **projectsApi**    | `entities/project/api/projectsApi.ts`        | RTK Query for projects                 |
| **contactApi**     | `features/contact/api/contactApi.ts`         | RTK Query for contact form             |

---

## Typed Hooks

```typescript
// src/app/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## UI Slice Structure

```typescript
// src/features/ui/model/uiSlice.ts
interface UIState {
  sidebar: {
    isOpen: boolean;
    isHoverExpanded: boolean;
  };
  mobileMenu: {
    isOpen: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
}
```

### Actions

- `toggleSidebar()`
- `setSidebarOpen(open: boolean)`
- `toggleMobileMenu()`
- `closeMobileMenu()`
- `openModal(modalId: string)`
- `closeModal(modalId: string)`

---

## Admin Slice Structure

```typescript
// src/features/admin/model/adminSlice.ts
interface AdminState {
  isAdminMode: boolean;
  isEditModalOpen: boolean;
  editingSection: string | null;
}
```

### Actions

- `toggleAdminMode()`
- `setAdminMode(isOpen: boolean)`
- `openEditModal(section: string)`
- `closeEditModal()`

---

## Developer Slice Structure

```typescript
// src/entities/developer/model/developerSlice.ts
interface DeveloperState {
  fullName: string;
  profession: string;
  specialties: string[];
  skillsLabel: string;
  yearsOfExperience: number;
  age: number;
}
```

### Actions

- `updateDeveloperData(data: Partial<DeveloperState>)`
- `resetDeveloperData()`

---

## RTK Query APIs

### Projects API

```typescript
// src/entities/project/api/projectsApi.ts
export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
  }),
});
```

### Contact API

```typescript
// src/features/contact/api/contactApi.ts
export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    sendContactForm: builder.mutation<void, ContactFormData>({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
      onQueryStarted: async (args, { dispatch, queryFulfilled }) => {
        // Optimistic update logic
      },
    }),
  }),
});
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Store                                │
├─────────────────────────────────────────────────────────────┤
│  uiSlice          │ Sidebar, MobileMenu, Modals state       │
│  adminSlice       │ Admin mode, Edit modal state            │
│  developerSlice   │ Hero data (editable)                    │
│  projectsApi      │ Projects cache, loading, errors         │
│  contactApi       │ Form submission state                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Components                                │
├─────────────────────────────────────────────────────────────┤
│  Sidebar          │ useAppSelector(uiSlice)                 │
│  MobileMenu       │ useAppSelector(uiSlice)                 │
│  AdminToggle      │ useAppSelector(adminSlice)              │
│  EditHeroModal    │ useAppSelector(developerSlice)          │
│  MyWork           │ useGetProjectsQuery()                   │
│  ContactForm      │ useSendContactFormMutation()            │
└─────────────────────────────────────────────────────────────┘
```

---

## Middleware Configuration

```typescript
// src/app/store.ts
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types for File uploads
      ignoredActions: ['contactApi/sendContactForm'],
      // Ignore these field paths in state
      ignoredPaths: ['contactApi.mutations'],
    },
  }).concat(projectsApi.middleware).concat(contactApi.middleware),
```

---

## LocalStorage Persistence

```typescript
// Для adminSlice и developerSlice
const loadFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};
```

---

## Summary

| Параметр                | Значение                                          |
| ----------------------- | ------------------------------------------------- |
| **Total Slices**        | 5 (ui, admin, developer, projectsApi, contactApi) |
| **Total Actions**       | 15+                                               |
| **RTK Query Endpoints** | 3 (getProjects, getProjectById, sendContactForm)  |
| **Persistence**         | localStorage для admin и developer slices         |
| **Middleware**          | Redux DevTools, RTK Query middleware              |
