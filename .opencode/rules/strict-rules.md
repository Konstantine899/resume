# Strict Validation Rules - Абсолютные Запреты

## 🚫 ТИПЫ ДАННЫХ:

- НИКАКИХ `any` типов - только строгая типизация
- НИКАКИХ implicit any - явные аннотации типов
- НИКАКИХ неиспользуемых переменных (кроме \_префикса)

## 🚫 ARCHITECTURE:

- НИКАКИХ нарушений FSD правил импортов
- НИКАКИХ циклических зависимостей между слоями
- НИКАКИХ default exports из публичного API

## 🚫 REACT:

- НИКАКИХ missing dependency arrays в useEffect
- НИКАКИХ прямых мутаций состояния
- НИКАКИХ необработанных ошибок в компонентах
- НИКАКИХ пропущенных error boundaries

## 🚫 SECURITY:

- НИКАКИХ console.log в продакшен коде
- НИКАКИХ паролей/ключей в коде
- НИКАКИХ невалидированных пользовательских входов

## 🚫 PERFORMANCE:

- НИКАКИХ утечек памяти (event listeners, intervals)
- НИКАКИХ unoptimized дорогих вычислений
- НИКАКИХ missing memoization для частых перерисовок

## 🚫 CODE STYLE:

- НИКАКИХ !important в CSS/SCSS
- НИКАКИХ глобальных стилей (только модули)
- НИКАКИХ несемантических HTML тегов (div вместо button)

## ⚡ AUTOMATIC FAILURES:

Эти нарушения должны автоматически проваливать проверки:

- Any использование типа `any`
- Нарушения FSD layer dependencies
- Циклические зависимости
- Security vulnerabilities
- Critical memory leaks

---

**Strict Rules enforced at Senior SaaS Advanced level**
