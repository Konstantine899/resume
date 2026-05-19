# 📍 Шаг 3: Создание Developer Entity

**Время:** 10 минут  
**Статус:** ⏳ Ожидает выполнения  
**Слой:** `entities/Developer`

---

## 🎯 Цель шага

Создать entity с централизованными данными разработчика:

- Полное имя: Konstantin Atroshchenko
- URL аватара: `/photo/konstantin.jpg`
- Размер аватара: 224px
- Валидация данных через `validateImage`

---

## 📁 Создаваемые файлы

```
src/entities/Developer/
├── constants.ts      # ✅ Создать (данные)
└── index.ts          # ✅ Создать (экспорты)
```

---

## 📝 Инструкция

### 3.1: Создание constants.ts

**Файл:** `src/entities/Developer/constants.ts`

```typescript
import { validateImage } from '@/shared/lib/utils';

/**
 * Интерфейс данных разработчика
 */
export interface DeveloperData {
  /** Полное имя */
  fullName: string;
  /** URL аватара (для совместимости со stories) */
  avatarUrl: string;
  /** Размер аватара в пикселях (для Hero секции) */
  avatarSize: number;
  /** Должность */
  position: string;
  /** Локация */
  location: string;
}

/**
 * Данные разработчика Konstantin Atroshchenko
 *
 * @remarks
 * Используется в:
 * - Hero секция (avatar)
 * - About секция (информация)
 * - Storybook stories (тестирование)
 * - Sidebar (заголовок)
 */
export const DEVELOPER_DATA: DeveloperData = {
  fullName: 'Konstantin Atroshchenko',
  avatarUrl: validateImage('/photo/konstantin.jpg') ? '/photo/konstantin.jpg' : undefined,
  avatarSize: 224, // 14rem = 224px (Hero секция)
  position: 'Full-Stack Developer',
  location: 'Remote',
};
```

**Важные моменты:**

1. **`avatarUrl` а не `photoUrl`** — для совместимости с существующими Avatar stories
2. **Валидация через `validateImage`** — защита от некорректных путей
3. **`avatarSize: 224`** — размер для Hero секции (14rem)
4. **`undefined` при ошибке** — Avatar автоматически покажет fallback

**Проверка:**

- [ ] Файл создан
- [ ] TypeScript компилируется
- [ ] Валидация работает

---

### 3.2: Создание index.ts

**Файл:** `src/entities/Developer/index.ts`

```typescript
// Экспорт данных
export { DEVELOPER_DATA } from './constants';

// Экспорт типов
export type { DeveloperData } from './constants';
```

**Проверка:**

- [ ] Файл создан
- [ ] Экспорты работают
- [ ] TypeScript видит типы

---

## ✅ Чек-лист завершения шага

### Файлы:

- [ ] `src/entities/Developer/constants.ts` создан
- [ ] `src/entities/Developer/index.ts` создан

### Функциональность:

- [ ] `DEVELOPER_DATA` доступна для импорта
- [ ] `avatarUrl` проходит валидацию
- [ ] `avatarSize: 224` корректный
- [ ] Типы экспортируются

### Интеграция:

- [ ] Avatar stories работают с `DEVELOPER_DATA`
- [ ] Hero компонент может импортировать данные
- [ ] TypeScript видит типы

### Код:

- [ ] TypeScript компилируется
- [ ] ESLint без ошибок
- [ ] `npm run type-check` проходит
- [ ] `npm run lint` проходит

---

## 🧪 Тестирование

### Быстрая проверка в консоли:

```typescript
// Открыть DevTools Console в Storybook или приложении

// Импортировать данные
import { DEVELOPER_DATA } from '@/entities/Developer';

// Проверить значения
console.log(DEVELOPER_DATA.fullName);
// "Konstantin Atroshchenko"

console.log(DEVELOPER_DATA.avatarUrl);
// "/photo/konstantin.jpg" или undefined

console.log(DEVELOPER_DATA.avatarSize);
// 224

// Проверить валидацию
import { validateImage } from '@/shared/lib/utils';
console.log(validateImage('/photo/konstantin.jpg'));
// true (если файл существует)

console.log(validateImage('invalid-url'));
// false
```

### Проверка в Storybook:

```bash
# Запустить Storybook
npm run storybook

# Открыть Avatar stories
# http://localhost:6006/?path=/story/shared-avatar--developer-with-photo

# Проверить что:
# - Avatar отображается с именем из DEVELOPER_DATA
# - Размер соответствует avatarSize
```

---

## 🚨 Возможные проблемы

### Проблема 1: validateImage не существует

**Симптомы:**

```
Module '"@/shared/lib/utils"' has no exported member 'validateImage'.
```

**Решение:**

```typescript
// Проверить что validateImage экспортируется в utils
// src/shared/lib/utils/index.ts

export { validateImage } from './validateImage'; // ✅ Должно быть

// Если удалён на Шаге 4, использовать простую проверку:
const isValidUrl = (url: string) => {
  return url && url.startsWith('/');
};

export const DEVELOPER_DATA = {
  avatarUrl: isValidUrl('/photo/konstantin.jpg') ? '/photo/konstantin.jpg' : undefined,
};
```

### Проблема 2: Avatar stories не работают

**Симптомы:**

```
Cannot find module '@/entities/Developer'
```

**Решение:**

```bash
# Перезапустить Storybook
npm run storybook

# Проверить что entity создан
ls src/entities/Developer/

# Проверить index.ts
cat src/entities/Developer/index.ts
```

### Проблема 3: Фото не загружается

**Симптомы:**

- Avatar показывает иконку вместо фото

**Решение:**

```bash
# Проверить что фото существует
ls public/photo/konstantin.jpg

# Проверить путь в браузере
# http://localhost:3000/photo/konstantin.jpg

# Если файла нет:
# 1. Создать директорию
mkdir -p public/photo

# 2. Поместить фотографию
# Файл: public/photo/konstantin.jpg
# Требования: 400x400px, JPG/WebP
```

### Проблема 4: Неправильный размер

**Симптомы:**

- Avatar слишком маленький или большой

**Решение:**

```typescript
// Проверить avatarSize в constants.ts
avatarSize: 224, // ✅ Должно быть 224px

// Проверить передачу в Hero компоненте
<Avatar
  size={DEVELOPER_DATA.avatarSize} // ✅ 224
  // ...
/>
```

---

## 📚 Использование в других компонентах

### Hero компонент:

```typescript
import { Avatar } from '@/shared/ui/Avatar';
import { DEVELOPER_DATA } from '@/entities/Developer';

<Avatar
  src={DEVELOPER_DATA.avatarUrl}
  size={DEVELOPER_DATA.avatarSize}
  alt={DEVELOPER_DATA.fullName}
  shape="circle"
/>
```

### About компонент:

```typescript
import { DEVELOPER_DATA } from '@/entities/Developer';

<h2>{DEVELOPER_DATA.fullName}</h2>
<p>{DEVELOPER_DATA.position}</p>
<p>{DEVELOPER_DATA.location}</p>
```

### Sidebar компонент:

```typescript
import { DEVELOPER_DATA } from '@/entities/Developer';

<Heading>{DEVELOPER_DATA.fullName}</Heading>
```

### Storybook stories:

```typescript
import { DEVELOPER_DATA } from '@/entities/Developer';

export const DeveloperWithPhoto: Story = {
  args: {
    src: DEVELOPER_DATA.avatarUrl,
    name: DEVELOPER_DATA.fullName,
    size: DEVELOPER_DATA.avatarSize,
  },
};
```

---

## 🔗 Предыдущий шаг

[📍 Шаг 2: Рефакторинг Avatar](./avatar-step-2-avatar.md)

## 🔗 Следующий шаг

[📍 Шаг 4: Очистка Utils](./avatar-step-4-utils.md)

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage
[✅] Шаг 2: Avatar
[✅] Шаг 3: Developer Entity  ← Текущий
[⏳] Шаг 4: Utils Cleanup
[⏳] Шаг 5: Hero Integration
[⏳] Шаг 6: Testing
```

**Время выполнения:** ~10 минут
