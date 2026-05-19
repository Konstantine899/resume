# 📍 Шаг 4: Очистка shared/lib/utils

**Время:** 10 минут  
**Статус:** ⏳ Ожидает выполнения  
**Слой:** `shared/lib/utils`

---

## 🎯 Цель шага

Очистить `shared/lib/utils` от устаревших функций:

- ❌ Удалить `getImageWithFallback` (логика в AppImage)
- 🔄 Перенести `preloadImage` в `shared/lib/images` (опционально)
- ✅ Сохранить `validateImage`, `getInitials`, `getContrastColor`
- ✅ Обновить экспорты в `index.ts`

---

## 📁 Изменяемые файлы

```
src/shared/lib/utils/
├── index.ts                    # ✅ Обновить (экспорты)
├── getImageWithFallback.ts     # ❌ Удалить
└── preloadImage.ts             # 🔄 Перенести (опционально)

src/shared/lib/images/          # 🔄 Создать (опционально)
├── preload.ts                  # 🔄 Переместить
└── index.ts                    # 🔄 Создать
```

---

## 📝 Инструкция

### 4.1: Удаление getImageWithFallback

**Файл:** `src/shared/lib/utils/getImageWithFallback.ts`

**Задача:** Удалить файл (логика перенесена в AppImage)

```bash
# Удалить файл
rm src/shared/lib/utils/getImageWithFallback.ts

# Или через Windows Explorer:
# Delete file: D:\Dev\projects\resume\src\shared\lib\utils\getImageWithFallback.ts
```

**Почему удаляем:**

- ❌ Логика дублируется в `AppImage` компоненте
- ❌ Устаревший паттерн (строки вместо компонентов)
- ❌ Не используется в новой архитектуре

**Проверка:**

```bash
# Найти все использования (должно быть пусто)
grep -r "getImageWithFallback" src/
```

---

### 4.2: Обновление index.ts

**Файл:** `src/shared/lib/utils/index.ts`

**Задача:** Обновить экспорты после удаления

```typescript
// ============================================
// Экспорты shared/lib/utils
// ============================================

// ✅ classNames утилиты
export { classNames, cn, createBEM, createNamespace } from './classNames';

// ✅ Debounce
export { debounce } from './debounce';

// ✅ Color utilities
export { getContrastColor } from './getContrastColor';

// ✅ String utilities
export { getInitials } from './getInitials';

// ✅ Image validation
export { validateImage } from './validateImage';

// ❌ Удалено (логика в AppImage):
// export { getImageWithFallback } from './getImageWithFallback';

// ❌ Удалено (перенесено в images):
// export { preloadImage, preloadImages } from './preloadImage';
```

**Проверка:**

- [ ] Файл обновлён
- [ ] TypeScript компилируется
- [ ] Экспорты работают

---

### 4.3: Перенос preloadImage (Опционально)

**Файл:** `src/shared/lib/utils/preloadImage.ts`

**Задача:** Перенести в отдельную директорию `images/`

⚠️ **Опционально:** Выполнять только если `preloadImage` используется вне AppImage!

#### 4.3.1: Создать директорию images

```bash
mkdir -p src/shared/lib/images
```

#### 4.3.2: Переместить файл

```bash
mv src/shared/lib/utils/preloadImage.ts src/shared/lib/images/preload.ts
```

#### 4.3.3: Обновить содержимое

**Файл:** `src/shared/lib/images/preload.ts`

````typescript
/**
 * Предзагрузить изображение
 *
 * @param src - URL изображения
 * @returns Promise который резолвится когда изображение загружено
 *
 * @example
 * ```ts
 * const img = await preloadImage('/avatar.jpg');
 * console.log('Image loaded:', img);
 * ```
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Предзагрузить несколько изображений
 *
 * @param srcs - Массив URL изображений
 * @returns Promise который резолвится когда все изображения загружены
 *
 * @example
 * ```ts
 * const images = await preloadImages(['/img1.jpg', '/img2.jpg']);
 * ```
 */
export const preloadImages = (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};
````

#### 4.3.4: Создать index.ts

**Файл:** `src/shared/lib/images/index.ts`

```typescript
// Экспорты для работы с изображениями
export { preloadImage, preloadImages } from './preload';
```

#### 4.3.5: Обновить использования

```bash
# Найти все использования
grep -r "preloadImage" src/

# Обновить импорты:
# БЫЛО:
import { preloadImage } from '@/shared/lib/utils';

// СТАЛО:
import { preloadImage } from '@/shared/lib/images';
```

**Проверка:**

- [ ] Файл перемещён
- [ ] Импорты обновлены
- [ ] TypeScript компилируется

---

## ✅ Чек-лист завершения шага

### Файлы:

- [ ] `getImageWithFallback.ts` удалён
- [ ] `utils/index.ts` обновлён
- [ ] `images/` директория создана (опционально)
- [ ] `preload.ts` перемещён (опционально)
- [ ] `images/index.ts` создан (опционально)

### Функциональность:

- [ ] `getImageWithFallback` не используется
- [ ] `validateImage` работает
- [ ] `getInitials` работает
- [ ] `preloadImage` работает (если перенесён)

### Интеграция:

- [ ] Developer entity использует `validateImage`
- [ ] AppImage не зависит от utils
- [ ] TypeScript компилируется

### Код:

- [ ] `npm run type-check` проходит
- [ ] `npm run lint` проходит
- [ ] grep не находит удалённые функции

---

## 🧪 Тестирование

### Проверка что getImageWithFallback удалён:

```bash
# Поиск по проекту (должно вернуть пустой результат)
grep -r "getImageWithFallback" src/

# Поиск импортов
grep -r "from.*utils.*getImageWithFallback" src/
```

### Проверка что validateImage работает:

```typescript
// Открыть DevTools Console

import { validateImage } from '@/shared/lib/utils';
import { DEVELOPER_DATA } from '@/entities/Developer';

// Проверить валидацию
console.log(validateImage('/photo/konstantin.jpg'));
// true (если путь корректный)

console.log(validateImage('invalid-url'));
// false

console.log(DEVELOPER_DATA.avatarUrl);
// "/photo/konstantin.jpg" или undefined
```

### Проверка что preloadImage работает (если перенесён):

```typescript
import { preloadImage } from '@/shared/lib/images';

// Протестировать
preloadImage('/photo/konstantin.jpg')
  .then((img) => console.log('Loaded:', img))
  .catch((err) => console.error('Error:', err));
```

---

## 🚨 Возможные проблемы

### Проблема 1: TypeScript ошибки после удаления

**Симптомы:**

```
Module '"@/shared/lib/utils"' has no exported member 'getImageWithFallback'.
```

**Решение:**

```bash
# Найти где используется
grep -r "getImageWithFallback" src/

# Заменить на AppImage:
# БЫЛО:
import { getImageWithFallback } from '@/shared/lib/utils';
const src = getImageWithFallback({ primary, fallback });
<img src={src} />

// СТАЛО:
import { AppImage } from '@/shared/ui/AppImage';
<AppImage src={primary} errorFallback={fallback} />
```

### Проблема 2: validateImage не работает

**Симптомы:**

```
TypeError: validateImage is not a function
```

**Решение:**

```typescript
// Проверить что validateImage экспортируется
// src/shared/lib/utils/index.ts

export { validateImage } from './validateImage'; // ✅

// Проверить что файл существует
ls src/shared/lib/utils/validateImage.ts
```

### Проблема 3: preloadImage сломался после переноса

**Симптомы:**

```
Cannot find module '@/shared/lib/utils/preloadImage'
```

**Решение:**

```typescript
// Обновить импорты во всём проекте
// БЫЛО:
import { preloadImage } from '@/shared/lib/utils';

// СТАЛО:
import { preloadImage } from '@/shared/lib/images';

# Автоматическая замена (VS Code):
# Ctrl+Shift+H → найти и заменить
```

### Проблема 4: ESLint предупреждения

**Симптомы:**

```
warning  'getImageWithFallback' is defined but never used
```

**Решение:**

```bash
# Файл уже удалён, нужно обновить index.ts
# Проверить что экспорт удалён из index.ts

cat src/shared/lib/utils/index.ts
# export { getImageWithFallback } ... ← должно быть удалено
```

---

## 📊 Что осталось в utils

### ✅ Сохранённые функции:

| Функция            | Назначение            | Использование    |
| ------------------ | --------------------- | ---------------- |
| `classNames`       | Объединение классов   | Все компоненты   |
| `cn`               | Алиас classNames      | Все компоненты   |
| `createBEM`        | BEM нейминг           | SCSS модули      |
| `createNamespace`  | Namespace для modules | SCSS modules     |
| `debounce`         | Debounce функция      | Search, Input    |
| `getContrastColor` | Контрастный цвет      | Темизация        |
| `getInitials`      | Инициалы из имени     | Avatar fallback  |
| `validateImage`    | Валидация URL         | Developer entity |

### ❌ Удалённые функции:

| Функция                | Причина           | Замена                 |
| ---------------------- | ----------------- | ---------------------- |
| `getImageWithFallback` | Логика в AppImage | `<AppImage>` компонент |
| `preloadImage`         | Перенесено        | `shared/lib/images`    |

---

## 🔗 Предыдущий шаг

[📍 Шаг 3: Создание Developer Entity](./avatar-step-3-entity.md)

## 🔗 Следующий шаг

[📍 Шаг 5: Интеграция в Hero](./avatar-step-5-integration.md)

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage
[✅] Шаг 2: Avatar
[✅] Шаг 3: Developer Entity
[✅] Шаг 4: Utils Cleanup  ← Текущий
[⏳] Шаг 5: Hero Integration
[⏳] Шаг 6: Testing
```

**Время выполнения:** ~10 минут
