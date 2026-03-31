# 📚 Руководство по Feature-Sliced Design (FSD)

## 🎯 Что такое FSD?

**Feature-Sliced Design (FSD)** - это архитектурная методология для фронтенд-приложений, которая разделяет код по бизнес-логике и переиспользуемости.

### Ключевые принципы:
- **Разделение ответственности** - каждый слой имеет четкую зону ответственности
- **Переиспользуемость** - компоненты можно использовать в разных частях приложения
- **Масштабируемость** - легко добавлять новые фичи и сущности
- **Поддерживаемость** - изолированные модули проще тестировать и изменять

## 🏗️ Иерархия слоёв

### 1. Shared Layer (`shared/`)
**Назначение**: Переиспользуемый код без бизнес-логики.

**Что содержит**:
- UI компоненты (Button, Input, Modal)
- Утилиты и хелперы
- Хуки (useLocalStorage, useTheme)
- Контексты (ThemeContext, LanguageContext)
- Стили (переменные, миксины)
- Типы TypeScript

**Правила**:
- ✅ Можно импортировать только из `shared`
- ❌ Нельзя импортировать из других слоёв
- 🎯 Максимальная переиспользуемость

### 2. Entities Layer (`entities/`)
**Назначение**: Бизнес-сущности приложения.

**Что содержит**:
- Типы данных (User, Product, Order)
- Константы и mock данные
- Интерфейсы и модели

**Правила**:
- ✅ Можно импортировать из `shared`
- ❌ Нельзя импортировать из `features`, `widgets`, `pages`
- 🎯 Только данные, без UI логики

### 3. Features Layer (`features/`)
**Назначение**: Пользовательские сценарии и бизнес-фичи.

**Что содержит**:
- Компоненты конкретных фич (LoginForm, ProductCard)
- Бизнес-логику фич
- Стили фич
- Типы относящиеся к фичам

**Правила**:
- ✅ Можно импортировать из `shared` и `entities`
- ❌ Нельзя импортировать из `widgets` и `pages`
- 🎯 Одна фича = один пользовательский сценарий

### 4. Widgets Layer (`widgets/`)
**Назначение**: Независимые блоки интерфейса.

**Что содержит**:
- Сложные UI компоненты (Sidebar, Header, Dashboard)
- Композицию нескольких фич
- Собственную логику виджета

**Правила**:
- ✅ Можно импортировать из `shared`, `entities`, `features`
- ❌ Нельзя импортировать из `pages`
- 🎯 Независимые, переиспользуемые блоки

### 5. Pages Layer (`pages/`)
**Назначение**: Страницы приложения.

**Что содержит**:
- Компоненты страниц
- Композицию виджетов и фич
- Маршрутизацию

**Правила**:
- ✅ Можно импортировать из всех слоёв
- 🎯 Минимальная бизнес-логика

### 6. App Layer (`app/`)
**Назначение**: Инициализация приложения.

**Что содержит**:
- Корневой layout
- Провайдеры (Theme, Router, Store)
- Глобальную конфигурацию

**Правила**:
- ✅ Можно импортировать из всех слоёв
- 🎯 Только инициализация и конфигурация

## 🔗 Правила импортов

### ✅ Разрешенные импорты (сверху вниз):
```typescript
// App → все слои
import { Button } from '@/shared/ui/Button';
import { User } from '@/entities/User';
import { Auth } from '@/features/Auth';

// Pages → все слои
import { Sidebar } from '@/widgets/Sidebar';
import { Dashboard } from '@/features/Dashboard';

// Widgets → shared, entities, features
import { Card } from '@/shared/ui/Card';
import { Product } from '@/entities/Product';

// Features → shared, entities
import { Button } from '@/shared/ui/Button';
import { User } from '@/entities/User';

// Entities → shared
import { Api } from '@/shared/lib/api';

// Shared → только shared
import { utils } from '@/shared/lib/utils';
```

### ❌ Запрещенные импорты (снизу вверх):
```typescript
// Shared → Entities (КРОМЕ ТИПОВ)
import { User } from '@/entities/User';        // ✅ Можно (типы)
import { userApi } from '@/entities/User/api'; // ❌ Нельзя (логика)

// Entities → Features
import { AuthForm } from '@/features/Auth';    // ❌ Нельзя

// Features → Widgets
import { Sidebar } from '@/widgets/Sidebar';   // ❌ Нельзя

// Widgets → Pages
import { HomePage } from '@/pages/Home';       // ❌ Нельзя
```

## 📁 Структура файлов

### Для компонентов:
```
shared/ui/Button/
├── index.ts           # Чистый экспорт
├── Button.tsx         # React компонент
├── Button.module.scss # Стили
└── types.ts           # TypeScript типы
```

### Для фич:
```
features/Auth/
├── index.ts           # Публичный API
├── types.ts           # Типы фичи
├── ui/                # UI компоненты
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── hooks/             # Бизнес-логика
│   └── useAuth.ts
└── styles/            # Стили фичи
    └── Auth.module.scss
```

## 🏆 Лучшие практики

### 1. Чистые публичные API
Каждый слой должен экспортировать чистый API:

```typescript
// ХОРОШО
// shared/ui/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './types';

// ПЛОХО
// Не экспортируй внутренние детали
export { Button } from './Button';
export { buttonStyles } from './styles'; // ❌ Внутренняя деталь
```

### 2. Изоляция ответственности
- **Shared**: Только переиспользуемый код
- **Entities**: Только данные и типы
- **Features**: Один пользовательский сценарий
- **Widgets**: Независимые UI блоки
- **Pages**: Композиция, минимальная логика

### 3. Именование
- **Компоненты**: PascalCase (Button, UserProfile)
- **Файлы**: Соответствуют имени компонента
- **Папки**: kebab-case (user-profile) или PascalCase
- **Типы**: Интерфейсы с Props суффиксом (ButtonProps)

### 4. TypeScript
- Используй строгий режим
- Описывай интерфейсы для всех пропсов
- Используй дженерики для переиспользуемых компонентов
- Избегай `any` типа

## 🚀 Начало работы

### 1. Начни с Shared Layer
Создай базовые компоненты перед бизнес-логикой:
- Button, Input, Card, Modal
- Хуки (useLocalStorage, useTheme)
- Утилиты (formatDate, classNames)

### 2. Определи Entities
Определи основные сущности проекта:
- User, Product, Order, Category
- Типы и интерфейсы
- Mock данные для разработки

### 3. Создай Features
Разработай пользовательские сценарии:
- Auth (авторизация)
- Dashboard (дашборд)
- Profile (профиль)

### 4. Собери Widgets
Создай сложные UI блоки:
- Sidebar (навигация)
- Header (шапка)
- Footer (подвал)

### 5. Настрой Pages
Создай страницы приложения:
- Home (главная)
- About (о нас)
- Contact (контакты)

## 🔍 Проверка архитектуры

После создания компонента спроси себя:

### 1. Правильный ли слой?
- Это переиспользуемый UI компонент? → Shared
- Это бизнес-данные? → Entities
- Это пользовательский сценарий? → Features
- Это независимый UI блок? → Widgets
- Это страница? → Pages

### 2. Правильные ли импорты?
- Не импортируешь снизу вверх?
- Не смешиваешь ответственности?
- Используешь чистые публичные API?

### 3. Не слишком ли много ответственности?
- Компонент делает одну вещь?
- Можно ли разделить на меньшие компоненты?
- Логика изолирована правильно?

## 📚 Дополнительные ресурсы

- [Официальная документация FSD](https://feature-sliced.design/)
- [Примеры проектов](https://github.com/feature-sliced/example)
- [Best Practices](https://feature-sliced.design/docs/get-started/overview)
- [Видео руководства](https://www.youtube.com/results?search_query=feature+sliced+design)

## 🎯 Заключение

FSD архитектура обеспечивает твоему проекту:
- 🏗️ **Четкую структуру** с первого дня
- 📈 **Масштабируемость** для роста
- 🔧 **Поддерживаемость** для команды
- 🧪 **Тестируемость** компонентов
- 🔄 **Переиспользуемость** кода

Начни с малого, следуй правилам, и твой проект будет расти здоровым и управляемым! 🚀