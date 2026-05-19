# 📍 Шаг 6: Тестирование и валидация

**Время:** 30 минут  
**Статус:** ⏳ Ожидает выполнения  
**Тип:** Финальное тестирование

---

## 🎯 Цель шага

Провести комплексное тестирование всех изменений:

- ✅ Функциональное тестирование Avatar
- ✅ Storybook валидация
- ✅ Проверка очистки utils
- ✅ Финальная сборка
- ✅ Подготовка к коммиту

---

## 📋 Чек-лист тестирования

### 6.1: Функциональное тестирование

#### Loading state:

- [ ] При загрузке страницы отображается скелетон
- [ ] Скелетон анимируется (shimmer эффект)
- [ ] После загрузки скелетон исчезает
- [ ] Анимация плавная (60fps)

#### Загрузка фото:

- [ ] Фото загружается корректно
- [ ] Фото обрезается в круг
- [ ] Качество фото приемлемое
- [ ] Нет растягивания/искажения
- [ ] Object-fit: cover работает

#### Fallback:

- [ ] При удалении файла фото показывается иконка
- [ ] Иконка центрирована правильно
- [ ] Иконка соответствует теме (dark/light)
- [ ] Нет ошибок в консоли

#### Декоративные элементы:

- [ ] Glow эффект пульсирует
- [ ] Ring видно вокруг аватара
- [ ] Элементы не перекрывают лицо
- [ ] Анимации работают плавно

---

### 6.2: Адаптивность

#### Мобильные устройства (<768px):

- [ ] Открыть DevTools → Toggle Device Toolbar
- [ ] Выбрать iPhone 12/13/14
- [ ] Проверить что avatar скрыт (если в дизайне)
- [ ] Контент центрирован корректно
- [ ] Нет горизонтального скролла

#### Планшет (768-1024px):

- [ ] Выбрать iPad Pro
- [ ] Avatar отображается
- [ ] Размер средний (~180px)
- [ ] Декорации на месте

#### Десктоп (>1024px):

- [ ] Полный размер (224px)
- [ ] Avatar справа от контента
- [ ] Glow и Ring видны
- [ ] Layout сбалансирован

#### Ландшафтный режим:

- [ ] Повернуть устройство
- [ ] Layout адаптируется
- [ ] Avatar не перекрывает контент

---

### 6.3: Темы

#### Dark Theme:

- [ ] Переключить на тёмную тему
- [ ] Фон аватара тёмный
- [ ] Скелетон тёмный
- [ ] Иконка светлая
- [ ] Glow эффект виден

#### Light Theme:

- [ ] Переключить на светлую тему
- [ ] Фон аватара светлый
- [ ] Скелетон светлый
- [ ] Иконка тёмная
- [ ] Glow эффект виден

#### Переключение тем:

- [ ] Переключить несколько раз
- [ ] Нет артефактов
- [ ] Цвета применяются мгновенно
- [ ] Анимации не прерываются

---

### 6.4: Storybook валидация

#### AppImage Stories:

```bash
# Запустить Storybook
npm run storybook

# Открыть http://localhost:6006
# Перейти к: Shared → AppImage
```

- [ ] `WithSkeleton` story работает
- [ ] `InvalidSource` story работает
- [ ] `WithPriority` story работает
- [ ] `ThemeComparison` story работает
- [ ] Обе темы отображаются корректно
- [ ] Нет ошибок в консоли Storybook

#### Avatar Stories:

```bash
# Перейти к: Shared → Avatar
```

- [ ] `Developer` story работает
- [ ] `DeveloperWithPhoto` story работает
- [ ] `CustomSize` story (224px) работает
- [ ] `Loading` story (скелетон) работает
- [ ] `Sizes` story (числовые размеры) работает
- [ ] `Shapes` story работает
- [ ] Нет ошибок в консоли Storybook

---

### 6.5: Проверка очистки utils

#### Поиск удалённых функций:

```bash
# Проверить что getImageWithFallback удалён
grep -r "getImageWithFallback" src/
# Должно вернуть пустой результат

# Проверить что preloadImage перенесён (если переносили)
grep -r "from '@/shared/lib/utils'" src/ | grep preload
# Должно вернуть пустой результат

# Проверить новый импорт preloadImage
grep -r "from '@/shared/lib/images'" src/
# Должно найти импорты если переносили
```

#### Проверка сохранённых функций:

```bash
# Проверить что validateImage используется
grep -r "validateImage" src/
# Должно найти в entities/Developer/constants.ts

# Проверить что getInitials доступен
grep -r "getInitials" src/
# Должно найти если используется где-то
```

#### TypeScript проверка:

```bash
# Запустить type check
npm run type-check

# Ожидаемый результат: 0 ошибок
```

---

### 6.6: Финальная сборка

#### Production сборка:

```bash
# Создать production сборку
npm run build

# Проверить что сборка успешна
# Ожидаемый результат:
# ✓ built in XXXms
```

#### Проверка bundle:

```bash
# Если есть анализ bundle
npm run build:analyze

# Проверить что:
# - Bundle size не увеличился значительно
# - Нет дублирования кода
# - Tree shaking работает
```

#### Lighthouse тест:

```bash
# Запустить dev сервер
npm run dev

# Открыть Chrome DevTools
# Lighthouse → Run audit

# Проверить метрики:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

---

### 6.7: Проверка кода

#### ESLint:

```bash
# Запустить линтинг
npm run lint

# Ожидаемый результат: 0 warnings, 0 errors
```

#### Prettier:

```bash
# Проверить форматирование
npm run format:check

# Или отформатировать
npm run format
```

#### Git status:

```bash
# Проверить изменения
git status

# Ожидаемые изменённые файлы:
# - src/shared/ui/AppImage/ (новые)
# - src/shared/ui/Avatar/ (обновлены)
# - src/entities/Developer/ (новые)
# - src/shared/lib/utils/ (удаления)
# - src/features/Hero/ (обновлены)
```

---

## 🚨 Финальный чек-лист

### Критические проблемы (блокируют мердж):

- [ ] TypeScript компилируется без ошибок
- [ ] ESLint без ошибок
- [ ] Сборка проходит успешно
- [ ] Avatar отображается в Hero
- [ ] Фото загружается или fallback работает
- [ ] `getImageWithFallback` не используется

### Важные проблемы (желательно исправить):

- [ ] Storybook stories работают
- [ ] Адаптивность не сломана
- [ ] Темы работают корректно
- [ ] Скелетон анимируется
- [ ] Декоративные элементы на месте

### Рекомендации (можно исправить позже):

- [ ] Lighthouse 90+ во всех категориях
- [ ] Bundle size оптимизирован
- [ ] Все тесты проходят
- [ ] Документация обновлена

---

## 📊 Метрики успеха

### Производительность:

```
Lighthouse Performance: ≥90
First Contentful Paint: <1.5s
Largest Contentful Paint: <2.5s
Cumulative Layout Shift: <0.1
```

### Качество кода:

```
TypeScript Errors: 0
ESLint Errors: 0
ESLint Warnings: 0
Test Coverage: ≥80% (если есть тесты)
```

### Функциональность:

```
Avatar загрузка: ✅
Loading state: ✅
Error fallback: ✅
Адаптивность: ✅
Темы: ✅
Storybook: ✅
```

---

## 🎯 Подготовка к коммиту

### 1. Проверка изменений:

```bash
# Посмотреть что будет закоммичено
git status
git diff
```

### 2. Добавить файлы:

```bash
# Добавить все изменения
git add .
```

### 3. Создать коммит:

```bash
git commit -m "feat(shared/ui): создать AppImage и рефакторить Avatar

- Создан универсальный AppImage компонент с loading/error states
- Avatar переписан на композицию с AppImage
- Добавлен Skeleton fallback и Icon errorFallback
- Создан Developer entity с данными Konstantin Atroshchenko
- Интегрирован в Hero секцию с реальным фото
- Сохранены декоративные элементы (glow, ring)
- Добавлена поддержка priority для LCP оптимизации
- Добавлены Storybook stories для AppImage
- Обновлены Avatar stories для нового API

refactor(shared/lib/utils): удалить getImageWithFallback

- Удалена функция getImageWithFallback (логика в AppImage)
- Перенесён preloadImage в shared/lib/images (опционально)
- Сохранены: getInitials, validateImage, getContrastColor
- Обновлены экспорты в index.ts

Closes #AVATAR-1"
```

### 4. Запушить изменения:

```bash
git push origin main
# Или создать PR
git push origin feature/avatar-migration
```

---

## 🎉 Пост-миграция

### После успешного завершения:

1. **Обновить документацию:**
   - [ ] Добавить AppImage в README
   - [ ] Обновить список компонентов
   - [ ] Добавить примеры использования

2. **Создать задачи на будущее:**
   - [ ] Использовать AppImage в MyWork проектах
   - [ ] Использовать AppImage в About секции
   - [ ] Добавить тесты для AppImage
   - [ ] Добавить тесты для Avatar

3. **Отпраздновать:**
   - [ ] ✅ Миграция завершена успешно!
   - [ ] 🎉 Сделать перерыв
   - [ ] ☕ Выпить кофе

---

## 📚 Чек-лист для печати

```
[ ] 1. Loading state работает
[ ] 2. Фото загружается
[ ] 3. Fallback на иконку
[ ] 4. Декорации на месте
[ ] 5. Мобильная адаптивность
[ ] 6. Планшетная адаптивность
[ ] 7. Десктоп адаптивность
[ ] 8. Dark theme
[ ] 9. Light theme
[ ] 10. AppImage stories (4 шт.)
[ ] 11. Avatar stories (обновлены)
[ ] 12. getImageWithFallback удалён
[ ] 13. validateImage работает
[ ] 14. TypeScript без ошибок
[ ] 15. ESLint без ошибок
[ ] 16. Сборка успешна
[ ] 17. Коммит создан
[ ] 18. Запушено в remote
```

---

## 🔗 Предыдущий шаг

[📍 Шаг 5: Интеграция в Hero](./avatar-step-5-integration.md)

## 🔗 Завершение

[📋 Вернуться к основному плану](./avatar-migration-plan.md)

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage
[✅] Шаг 2: Avatar
[✅] Шаг 3: Developer Entity
[✅] Шаг 4: Utils Cleanup
[✅] Шаг 5: Hero Integration
[✅] Шаг 6: Testing  ← Текущий
```

**Время выполнения:** ~30 минут

---

**🎉 Поздравляем! Миграция завершена успешно!**
