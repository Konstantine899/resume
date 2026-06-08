# Project Structure Overview

## Technology Stack:

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + Storybook + Playwright
- **Linting**: ESLint + Stylelint + Prettier
- **Architecture**: Feature-Sliced Design (FSD)

## Layer Structure:

```
src/
├── entities/ # Бизнес-сущности
├── features/ # Функциональности
├── pages/    # Страницы
├── widgets/  # Виджеты
└── shared/   # Переиспользуемые ресурсы
    ├── api/    # API клиенты
    ├── lib/    # Вспомогательные функции
    ├── styles/ # Глобальные стили
    ├── types/  # Глобальные типы
    └── ui/     # UI компоненты
```

## Key Conventions:

- Алиас `@/*` → `./src/*` в tsconfig.json
- Строгий режим TypeScript включен
- SCSS модули с BEM методологией
- Storybook для компонентов
