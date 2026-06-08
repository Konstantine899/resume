---
name: test-generation
description: Создание Vitest тестов для компонентов с proper coverage, mocking и edge cases. Use ONLY when adding tests to components.
---

# Test Generation Skill

## Когда использовать

Использовать ТОЛЬКО при:
- Создании новых тестов для компонентов
- Добавлении coverage для существующих компонентов
- Рефакторинге тестов

## Структура теста

```typescript
<ComponentName>.test.tsx
```

## Базовый шаблон

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('rendering', () => {
    it('должен рендериться с базовыми props', () => {
      render(<ComponentName>Content</ComponentName>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('должен применять className', () => {
      const { container } = render(
        <ComponentName className="custom-class">Content</ComponentName>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('interactions', () => {
    it('должен вызывать onClick', () => {
      const handleClick = vi.fn();
      render(<ComponentName onClick={handleClick}>Click</ComponentName>);
      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Паттерны тестирования

### 1. Render Tests

```typescript
describe('rendering', () => {
  it('должен рендериться с children', () => {
    render(<ComponentName>Test Content</ComponentName>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('должен рендериться с пустыми children', () => {
    const { container } = render(<ComponentName />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('должен применять size classes', () => {
    const { container } = render(<ComponentName size="lg">Content</ComponentName>);
    expect(container.firstChild).toHaveClass('lg');
  });

  it('должен применять variant classes', () => {
    const { container } = render(<ComponentName variant="primary">Content</ComponentName>);
    expect(container.firstChild).toHaveClass('primary');
  });
});
```

### 2. Interaction Tests

```typescript
describe('interactions', () => {
  it('должен вызывать onClick при клике', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick}>Click me</ComponentName>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать onChange при изменении', () => {
    const handleChange = vi.fn();
    render(<ComponentName onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать onSubmit при отправке формы', async () => {
    const handleSubmit = vi.fn();
    render(<ComponentName onSubmit={handleSubmit}>Submit</ComponentName>);
    fireEvent.submit(screen.getByRole('button'));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 3. State Tests

```typescript
describe('states', () => {
  it('должен быть disabled когда disabled=true', () => {
    render(<ComponentName disabled>Content</ComponentName>);
    expect(screen.getByText('Content')).toBeDisabled();
  });

  it('не должен вызывать onClick когда disabled', () => {
    const handleClick = vi.fn();
    render(<ComponentName disabled onClick={handleClick}>Click</ComponentName>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('должен показывать loading state', () => {
    render(<ComponentName loading>Content</ComponentName>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('должен показывать error state', () => {
    render(<ComponentName hasError>Content</ComponentName>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
```

### 4. Async Tests

```typescript
describe('async operations', () => {
  it('должен загружать данные', async () => {
    const mockData = { id: 1, name: 'Test' };
    vi.spyOn(API, 'fetchData').mockResolvedValue(mockData);

    render(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('должен обрабатывать ошибку загрузки', async () => {
    vi.spyOn(API, 'fetchData').mockRejectedValue(new Error('Failed'));

    render(<ComponentName />);

    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });
});
```

### 5. Accessibility Tests

```typescript
describe('accessibility', () => {
  it('должен иметь правильный role', () => {
    render(<ComponentName>Content</ComponentName>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('должен иметь aria-label', () => {
    render(<ComponentName aria-label="Close modal">X</ComponentName>);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('должен быть фокусируемым', () => {
    render(<ComponentName>Content</ComponentName>);
    const element = screen.getByRole('button');
    element.focus();
    expect(document.activeElement).toBe(element);
  });

  it('должен поддерживать keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick}>Click</ComponentName>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 6. Edge Cases

```typescript
describe('edge cases', () => {
  it('должен обрабатывать длинный контент', () => {
    const longText = 'A'.repeat(1000);
    render(<ComponentName>{longText}</ComponentName>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('должен обрабатывать special characters', () => {
    render(<ComponentName>{'<script>alert("xss")</script>'}</ComponentName>);
    expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
  });

  it('должен обрабатывать undefined props', () => {
    expect(() => render(<ComponentName />)).not.toThrow();
  });

  it('должен обрабатывать null children', () => {
    expect(() => render(<ComponentName>{null}</ComponentName>)).not.toThrow();
  });
});
```

## Mocking Patterns

### Module Mocking

```typescript
vi.mock('../../api/userApi', () => ({
  fetchUser: vi.fn(),
}));

import { fetchUser } from '../../api/userApi';

beforeEach(() => {
  vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'Test' });
});
```

### Hook Mocking

```typescript
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  mockUseAuth.mockReturnValue({ user: null, isLoading: false });
});
```

### Timer Mocking

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('должен вызывать debounce', () => {
  render(<ComponentName />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
  
  vi.advanceTimersByTime(300);
  expect(mockApiCall).toHaveBeenCalledTimes(1);
});
```

## Coverage Requirements

| Тип компонента | Мин. покрытие |
|----------------|---------------|
| UI Components | 90% |
| Utils/Helpers | 100% |
| Hooks | 95% |
| API layers | 90% |
| Critical paths | 100% |

## Чеклист

- [ ] Render tests для всех props
- [ ] Interaction tests для всех событий
- [ ] State tests (disabled, loading, error)
- [ ] Async tests с mocking
- [ ] Accessibility tests
- [ ] Edge cases
- [ ] Mocking настроен правильно
- [ ] Нет flaky tests
- [ ] Тесты изолированы
- [ ] Названия тестов описательные

## Запреты

- ❌ Не использовать any в тестах
- ❌ Не пропускать async/await
- ❌ Не создавать тесты без assertions
- ❌ Не использовать shared state между тестами
- ❌ Не пропускать cleanup
- ❌ Не игнорировать edge cases

## Best Practices

```typescript
// ✅ CORRECT - описательные названия
it('должен вызывать onClick при клике на кнопку', () => {});

// ❌ WRONG - vague названия
it('click test', () => {});

// ✅ CORRECT - Arrange-Act-Assert
it('должен обновлять состояние', () => {
  // Arrange
  const initialState = { count: 0 };
  
  // Act
  render(<ComponentName initial={initialState} />);
  fireEvent.click(screen.getByText('Increment'));
  
  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});

// ❌ WRONG - no structure
it('test', () => {
  render(<ComponentName />);
  // mixed arrange/act/assert
});
```

---

**Test Generation Skill - Senior Level** 🧪
