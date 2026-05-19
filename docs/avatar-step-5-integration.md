# 📍 Шаг 5: Интеграция Avatar в Hero компонент

**Время:** 25 минут  
**Статус:** ⏳ Ожидает выполнения  
**Слой:** `features/Hero`

---

## 🎯 Цель шага

Интегрировать новый компонент `Avatar` в Hero секцию:

- ✅ Заменить кастомный аватар с инициалами
- ✅ Использовать `DEVELOPER_DATA` из entity
- ✅ Сохранить декоративные элементы (glow, ring)
- ✅ Обновить стили Hero
- ✅ Проверить адаптивность

---

## 📁 Изменяемые файлы

```
src/features/Hero/
└── ui/
    ├── Hero.tsx            # ✅ Обновить (интеграция Avatar)
    └── Hero.module.scss    # ✅ Обновить (удалить старые классы)
```

---

## 📝 Инструкция

### 5.1: Обновление Hero.tsx

**Файл:** `src/features/Hero/ui/Hero.tsx`

**Задача:** Заменить кастомный аватар на компонент `Avatar`

#### Импорт компонентов:

```typescript
// ✅ Добавить импорты
import { Avatar } from '@/shared/ui/Avatar';
import { DEVELOPER_DATA } from '@/entities/Developer';
```

#### Удалить старый код:

```typescript
// ❌ Удалить импорт
import { getInitials } from '@/shared/lib/utils';

// ❌ Удалить старый код аватара
<div className={styles.rightContent}>
  <div className={styles.photoContainer}>
    <div className={styles.photoGlow} />
    <div className={styles.photoCircle}>
      <div className={styles.photoInner}>
        <span className={styles.initial}>
          {getInitials(DEVELOPER_DATA.fullName, { maxInitials: 1, index: 1 })}
        </span>
      </div>
    </div>
    <div className={styles.photoRing} />
  </div>
</div>
```

#### Добавить новый код:

```typescript
export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      {/* Фон и overlay */}
      <div className={styles.gradientBackground} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        {/* Левая часть - контент */}
        <div className={styles.leftContent}>
          {/* ... greeting, name, code block, button ... */}
        </div>

        {/* ✅ Правая часть с Avatar */}
        <div className={styles.rightContent}>
          <div className={styles.avatarWrapper}>
            {/* Декоративные элементы */}
            <div className={styles.photoGlow} />
            <div className={styles.photoRing} />

            {/* ✅ Компонент Avatar */}
            <Avatar
              src={DEVELOPER_DATA.avatarUrl}
              alt={DEVELOPER_DATA.fullName}
              size={DEVELOPER_DATA.avatarSize}
              shape="circle"
              className={styles.avatar}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
```

**Полный пример Hero.tsx:**

```typescript
import React from 'react';
import { Avatar } from '@/shared/ui/Avatar';
import { DEVELOPER_DATA } from '@/entities/Developer';
import { Button } from '@/shared/ui/Button';
import { Code } from '@/shared/ui/Code';
import styles from './Hero.module.scss';

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.gradientBackground} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        {/* Left Content */}
        <div className={styles.leftContent}>
          <p className={styles.greeting}>
            Привет, меня зовут
          </p>

          <h1 className={styles.name}>
            {DEVELOPER_DATA.fullName}
          </h1>

          <p className={styles.description}>
            {DEVELOPER_DATA.position}
          </p>

          <Code className={styles.code}>
            {`const developer = {
  name: "${DEVELOPER_DATA.fullName}",
  role: "${DEVELOPER_DATA.position}",
  location: "${DEVELOPER_DATA.location}",
};`}
          </Code>

          <Button
            variant="primary"
            size="lg"
            className={styles.ctaButton}
          >
            Связаться со мной
          </Button>
        </div>

        {/* Right Content - Avatar */}
        <div className={styles.rightContent}>
          <div className={styles.avatarWrapper}>
            {/* Decorative elements */}
            <div className={styles.photoGlow} />
            <div className={styles.photoRing} />

            {/* Avatar component */}
            <Avatar
              src={DEVELOPER_DATA.avatarUrl}
              alt={DEVELOPER_DATA.fullName}
              size={DEVELOPER_DATA.avatarSize}
              shape="circle"
              className={styles.avatar}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
```

**Проверка:**

- [ ] Старый код удалён
- [ ] Avatar интегрирован
- [ ] DEVELOPER_DATA используется
- [ ] Декоративные элементы на месте

---

### 5.2: Обновление Hero.module.scss

**Файл:** `src/features/Hero/ui/Hero.module.scss`

**Задача:** Адаптировать стили под новый Avatar

#### Удалить старые классы:

```scss
// ❌ Удалить эти классы (больше не нужны):
// .photoCircle
// .photoInner
// .initial
```

#### Обновить/Добавить классы:

```scss
// ✅ Avatar wrapper
.avatarWrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 224px; // 14rem
  height: 224px;

  @include respond-to('xl') {
    width: 288px; // 18rem
    height: 288px;
  }

  @include respond-to('xxl') {
    width: 320px; // 20rem
    height: 320px;
  }
}

// ✅ Avatar поверх декораций
.avatar {
  position: relative;
  z-index: 2;
}

// ✅ Декоративные элементы (остаются)
.photoGlow,
.photoRing {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

// ✅ Обновить photoGlow (если нужно)
.photoGlow {
  width: 100%;
  height: 100%;
  // ... остальные стили из оригинала
}

// ✅ Обновить photoRing (если нужно)
.photoRing {
  width: 100%;
  height: 100%;
  // ... остальные стили из оригинала
}
```

**Проверка:**

- [ ] Старые классы удалены
- [ ] Новые классы добавлены
- [ ] Адаптивность работает
- [ ] z-index корректный

---

## ✅ Чек-лист завершения шага

### Файлы:

- [ ] `Hero.tsx` обновлён
- [ ] `Hero.module.scss` обновлён
- [ ] Старые классы удалены
- [ ] Новые классы добавлены

### Функциональность:

- [ ] Avatar отображается
- [ ] Фото загружается (или fallback)
- [ ] Декоративные элементы на месте
- [ ] Glow эффект работает
- [ ] Ring виден вокруг аватара

### Адаптивность:

- [ ] Мобильные (<768px): фото скрыто
- [ ] Планшет (768-1024px): фото видно
- [ ] Десктоп (>1024px): полный размер
- [ ] Ландшафтный режим: корректно

### Интеграция:

- [ ] DEVELOPER_DATA используется
- [ ] Avatar компонент импортирован
- [ ] TypeScript компилируется
- [ ] Стили применяются

---

## 🧪 Тестирование

### Быстрая проверка:

```bash
# Запустить dev сервер
npm run dev

# Открыть http://localhost:3000
# Проверить Hero секцию
```

### Чек-лист визуальной проверки:

#### Desktop (>1024px):

- [ ] Avatar отображается справа
- [ ] Размер 224px (14rem)
- [ ] Glow эффект пульсирует
- [ ] Ring виден вокруг
- [ ] Фото загружается корректно
- [ ] Обрезка в круг работает

#### Планшет (768-1024px):

- [ ] Avatar виден
- [ ] Размер адаптируется
- [ ] Декорации на месте

#### Мобильные (<768px):

- [ ] Avatar скрыт (если в дизайне)
- [ ] Только контент слева
- [ ] Layout не сломан

#### Темы:

- [ ] Dark theme: цвета корректны
- [ ] Light theme: цвета корректны
- [ ] Переключение без артефактов

#### Loading state:

- [ ] При загрузке виден скелетон
- [ ] Скелетон анимируется
- [ ] После загрузки исчезает

#### Error state:

- [ ] При ошибке видна иконка
- [ ] Иконка центрирована
- [ ] Цвет соответствует теме

---

## 🚨 Возможные проблемы

### Проблема 1: Avatar не отображается

**Симптомы:**

- Пустое место где должен быть аватар

**Решение:**

```typescript
// Проверить импорты
import { Avatar } from '@/shared/ui/Avatar';
import { DEVELOPER_DATA } from '@/entities/Developer';

// Проверить передачу props
<Avatar
  src={DEVELOPER_DATA.avatarUrl}
  size={DEVELOPER_DATA.avatarSize}
  // ...
/>

// Проверить консоль на ошибки
// DevTools → Console
```

### Проблема 2: Декорации смещены

**Симптомы:**

- Glow или Ring не центрированы

**Решение:**

```scss
// Проверить позиционирование
.photoGlow,
.photoRing {
  position: absolute;
  inset: 0; // ✅ top: 0, right: 0, bottom: 0, left: 0
}

// Проверить z-index
.avatar {
  z-index: 2; // ✅ Поверх декораций
}

.photoGlow,
.photoRing {
  z-index: 1; // ✅ Под Avatar
}
```

### Проблема 3: Фото не загружается

**Симптомы:**

- Видна иконка вместо фото

**Решение:**

```bash
# Проверить что фото существует
ls public/photo/konstantin.jpg

# Проверить путь в браузере
# http://localhost:3000/photo/konstantin.jpg

# Проверить консоль на 404
# DevTools → Network → Img

# Если файла нет:
mkdir -p public/photo
# Поместить фотографию
```

### Проблема 4: Неправильный размер

**Симптомы:**

- Avatar слишком маленький/большой

**Решение:**

```typescript
// Проверить avatarSize в entity
console.log(DEVELOPER_DATA.avatarSize); // 224

// Проверить передачу в Hero
<Avatar size={DEVELOPER_DATA.avatarSize} />

// Проверить стили wrapper
.avatarWrapper {
  width: 224px;
  height: 224px;
}
```

### Проблема 5: Старые классы конфликтуют

**Симптомы:**

- Странные артефакты отображения

**Решение:**

```scss
// Удалить старые классы из Hero.module.scss
// ❌ .photoCircle
// ❌ .photoInner
// ❌ .initial

// Оставить только:
.avatarWrapper
.avatar
.photoGlow
.photoRing
```

---

## 📚 Дополнительные улучшения

### Опционально: Добавить loading state в Hero

```typescript
import { useState } from 'react';

export const Hero: React.FC = () => {
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);

  return (
    <section className={styles.hero}>
      {/* ... */}
      <Avatar
        src={DEVELOPER_DATA.avatarUrl}
        onLoadingChange={setIsAvatarLoading}
        // ...
      />
    </section>
  );
};
```

### Опционально: Добавить analytics

```typescript
<Avatar
  src={DEVELOPER_DATA.avatarUrl}
  onLoad={() => {
    console.log('Avatar loaded successfully');
    // Отправить analytics событие
  }}
  onError={() => {
    console.error('Avatar failed to load');
    // Отправить ошибку в analytics
  }}
/>
```

---

## 🔗 Предыдущий шаг

[📍 Шаг 4: Очистка Utils](./avatar-step-4-utils.md)

## 🔗 Следующий шаг

[📍 Шаг 6: Тестирование](./avatar-testing-checklist.md)

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage
[✅] Шаг 2: Avatar
[✅] Шаг 3: Developer Entity
[✅] Шаг 4: Utils Cleanup
[✅] Шаг 5: Hero Integration  ← Текущий
[⏳] Шаг 6: Testing
```

**Время выполнения:** ~25 минут
