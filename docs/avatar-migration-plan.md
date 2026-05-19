# 📋 План миграции Hero секции на компонент Avatar

**Версия:** 2.0  
**Дата обновления:** 2024  
**Статус:** ⏳ Ожидает выполнения  
**Оценочное время:** 2.5 часа  
**Приоритет:** 🔥 Высокий

---

## 🎯 Цель

Заменить кастомную реализацию аватара в Hero секции на композицию компонентов `AppImage` + `Avatar` из `shared/ui`.

### Ключевые задачи:

- ✅ Создать универсальный `AppImage` компонент с loading/error states
- ✅ Рефакторить `Avatar` на композицию с AppImage
- ✅ Загрузить реальное фото Konstantin Atroshchenko
- ✅ Создать `Developer` entity с централизованными данными
- ✅ Очистить `shared/lib/utils` от устаревших функций
- ✅ Обновить Storybook документацию
- ✅ Сохранить декоративные элементы (glow, ring)

---

## 📁 Структура документации

Этот план разбит на несколько файлов для удобства:

1. **`avatar-migration-plan.md`** (этот файл) — обзор и навигация
2. **`avatar-step-1-appimage.md`** — создание AppImage компонента
3. **`avatar-step-2-avatar.md`** — рефакторинг Avatar
4. **`avatar-step-3-entity.md`** — создание Developer entity
5. **`avatar-step-4-utils.md`** — очистка shared/lib/utils
6. **`avatar-step-5-integration.md`** — интеграция в Hero
7. **`avatar-testing-checklist.md`** — тестирование и валидация

---

## 🚀 Быстрый старт

### 1. Подготовка (5 мин)

```bash
# Создать backup ветку
git checkout -b backup/before-avatar-migration

# Убедиться что проект собирается
npm run build

# Запустить Storybook (для тестирования)
npm run storybook
```

### 2. Подготовка фото (10 мин)

```bash
# Создать директорию
mkdir -p public/photo

# Поместить фотографию
# Файл: public/photo/konstantin.jpg
# Требования: 400x400px, JPG/WebP, высокое качество
```

### 3. Выполнение шагов (120 мин)

| Шаг | Файл                           | Время  | Статус |
| --- | ------------------------------ | ------ | ------ |
| 1   | `avatar-step-1-appimage.md`    | 20 мин | ⏳     |
| 2   | `avatar-step-2-avatar.md`      | 25 мин | ⏳     |
| 3   | `avatar-step-3-entity.md`      | 10 мин | ⏳     |
| 4   | `avatar-step-4-utils.md`       | 10 мин | ⏳     |
| 5   | `avatar-step-5-integration.md` | 25 мин | ⏳     |
| 6   | `avatar-testing-checklist.md`  | 30 мин | ⏳     |

---

## 📦 Предварительные требования

### Технологический стек:

- **TypeScript** — строгая типизация
- **SASS/SCSS** — модульные стили
- **Storybook** — документация компонентов
- **FSD Architecture** — соблюдение слоёв

### Необходимые файлы:

- [ ] Фотография: `public/photo/konstantin.jpg`
- [ ] Чистый Working Tree (git status)
- [ ] Working Storybook (`npm run storybook`)

### Проверка перед началом:

```bash
# 1. Сборка проекта
npm run build

# 2. Storybook
npm run storybook

# 3. Тесты
npm run test

# 4. TypeScript
npm run type-check
```

---

## 🎯 Критерии успеха

### Функциональные:

1. [ ] Avatar отображает фото Konstantin Atroshchenko
2. [ ] Loading state работает (скелетон до загрузки)
3. [ ] Fallback на иконку при ошибке
4. [ ] Декоративные элементы (glow, ring) на месте
5. [ ] Адаптивность не сломана
6. [ ] Темы (dark/light) работают корректно

### Технические:

7. [ ] TypeScript без ошибок
8. [ ] ESLint без предупреждений
9. [ ] Сборка проходит успешно
10. [ ] Производительность не ухудшилась

### Storybook:

11. [ ] AppImage stories (3 шт.) работают
12. [ ] Avatar stories обновлены
13. [ ] Theme comparison виден

### Архитектурные:

14. [ ] `getImageWithFallback` удалён
15. [ ] `validateImage` используется в entity
16. [ ] FSD слои соблюдены

---

## 📊 Итоговая статистика

| Компонент        | Файлы                | Время        | Статус |
| ---------------- | -------------------- | ------------ | ------ |
| AppImage         | 3 файла              | 20 мин       | ⏳     |
| Avatar           | 3 файла (обновление) | 25 мин       | ⏳     |
| Developer Entity | 2 файла              | 10 мин       | ⏳     |
| Utils Cleanup    | 2 файла (удаление)   | 10 мин       | ⏳     |
| Hero Integration | 2 файла (обновление) | 25 мин       | ⏳     |
| Testing          | -                    | 30 мин       | ⏳     |
| **ВСЕГО**        | **~13 файлов**       | **~120 мин** | ⏳     |

---

## 🔗 Навигация по шагам

### [📍 Шаг 1: Создание AppImage компонента](./avatar-step-1-appimage.md)

- Создание `AppImage.tsx`
- Создание `AppImage.stories.tsx`
- Создание `index.ts`

### [📍 Шаг 2: Рефакторинг Avatar](./avatar-step-2-avatar.md)

- Обновление `Avatar.tsx` (композиция)
- Обновление `Avatar.stories.tsx`
- Обновление SCSS стилей

### [📍 Шаг 3: Создание Developer entity](./avatar-step-3-entity.md)

- Создание `constants.ts`
- Создание `index.ts`
- Валидация данных

### [📍 Шаг 4: Очистка utils](./avatar-step-4-utils.md)

- Удаление `getImageWithFallback`
- Перенос `preloadImage` (опционально)
- Обновление экспортов

### [📍 Шаг 5: Интеграция в Hero](./avatar-step-5-integration.md)

- Обновление `Hero.tsx`
- Обновление `Hero.module.scss`
- Проверка декораций

### [📍 Шаг 6: Тестирование](./avatar-testing-checklist.md)

- Функциональное тестирование
- Storybook валидация
- Финальная проверка

---

## 🚨 Возможные проблемы

| Проблема                          | Решение                    | Файл                           |
| --------------------------------- | -------------------------- | ------------------------------ |
| Avatar stories не работают        | Проверить `avatarUrl` поле | `avatar-step-3-entity.md`      |
| Скелетон не анимируется           | Проверить @keyframes       | `avatar-step-2-avatar.md`      |
| getImageWithFallback используется | Grep + замена на AppImage  | `avatar-step-4-utils.md`       |
| Storybook не видит stories        | Перезапустить Storybook    | `avatar-testing-checklist.md`  |
| Фото не загружается               | Проверить путь в public/   | `avatar-step-5-integration.md` |

---

## 📚 Дополнительные ресурсы

- [AppImage документация](../src/shared/ui/AppImage/README.md)
- [Avatar документация](../src/shared/ui/Avatar/README.md)
- [Storybook Guide](../.storybook/README.md)
- [FSD Architecture](./fsd-architecture.md)
- [SASS Variables](../src/shared/styles/variables/README.md)
- [Utils документация](../src/shared/lib/utils/README.md)

---

## ✅ Post-Migration Checklist

После успешной миграции:

- [ ] Обновить README проекта
- [ ] Проверить все story в Storybook
- [ ] Создать task на использование AppImage в других местах
- [ ] Проверить grep что `getImageWithFallback` не используется
- [ ] Запушить изменения в remote
- [ ] Создать PR (если в команде)
- [ ] Отпраздновать! 🎉

---

## 📈 Архитектурные улучшения

### До миграции:

```
❌ Логика загрузки в компонентах
❌ Утилиты смешаны с бизнес-логикой
❌ Нет единого компонента для изображений
❌ Хардкод путей в компонентах
❌ Нет Stories для новых компонентов
```

### После миграции:

```
✅ AppImage — универсальное решение
✅ Avatar — композиция на базе AppImage
✅ Developer entity — централизованные данные
✅ Utils очищен от устаревших функций
✅ Storybook документация обновлена
✅ FSD слои соблюдены
```

---

## 🎨 Компонентная архитектура

```
shared/ui/
├── AppImage/              # ✅ Новый компонент
│   ├── ui/
│   │   ├── AppImage.tsx
│   │   └── AppImage.stories.tsx
│   └── index.ts
│
└── Avatar/                # ✅ Рефакторинг
    ├── ui/
    │   ├── Avatar.tsx     # Композиция с AppImage
    │   └── Avatar.stories.tsx
    ├── types.ts
    └── index.ts

entities/
└── Developer/             # ✅ Новый entity
    ├── constants.ts
    └── index.ts

features/
└── Hero/                  # ✅ Интеграция
    └── ui/
        ├── Hero.tsx
        └── Hero.module.scss
```

---

**Контактное лицо:** Konstantin Atroshchenko  
**Дата следующего ревью:** После завершения миграции  
**Storybook:** http://localhost:6006  
**Dev Server:** http://localhost:3000

---

## 🚀 Начало работы

**Открыть следующий файл:** [`avatar-step-1-appimage.md`](./avatar-step-1-appimage.md)
