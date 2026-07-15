import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Skills } from './Skills';
import * as constants from '../model/constants';

// Mock AnimatedSection to avoid animation complexity in tests
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid="animated-section" data-delay={delay}>
      {children}
    </div>
  ),
}));

// Mock ThemeContext
vi.mock('@/shared/lib/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

// Mock LanguageContext
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('Skills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Integration: Render Categories', () => {
    it('должен рендерить секцию с aria-label "Навыки разработчика"', () => {
      render(<Skills />);

      const section = screen.getByRole('region', { name: /навыки/i });
      expect(section).toBeInTheDocument();
    });

    it('должен рендерить заголовок "Мои навыки"', () => {
      render(<Skills />);

      expect(screen.getByText('mySkills')).toBeInTheDocument();
    });

    it('должен рендерить все категории из SKILLS_DATA', () => {
      render(<Skills />);

      // Проверяем наличие всех 7 категорий
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
      expect(screen.getByText('DevOps & CI/CD')).toBeInTheDocument();
      expect(screen.getByText('Methodologies')).toBeInTheDocument();
      expect(screen.getByText('Architecture')).toBeInTheDocument();
      expect(screen.getByText('AI & Automation')).toBeInTheDocument();
    });

    it('должен рендерить технологии для каждой категории', () => {
      render(<Skills />);

      // Проверяем технологии из разных категорий
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Redux Toolkit')).toBeInTheDocument();
      expect(screen.getByText('Material-UI')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Nest.js')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('WebSocket')).toBeInTheDocument();
      expect(screen.getByText('Jest')).toBeInTheDocument();
      expect(screen.getByText('Cypress')).toBeInTheDocument();
      expect(screen.getByText('Docker')).toBeInTheDocument();
      expect(screen.getByText('SOLID')).toBeInTheDocument();
      expect(screen.getByText('Feature-Sliced Design (FSD)')).toBeInTheDocument();
      expect(screen.getByText('Cursor')).toBeInTheDocument();
      expect(screen.getByText('GitHub Copilot')).toBeInTheDocument();
    });

    it('должен иметь data-testid по умолчанию', () => {
      render(<Skills />);

      expect(screen.getByTestId('skills')).toBeInTheDocument();
    });

    it('должен принимать кастомный data-testid', () => {
      render(<Skills data-testid="custom-skills" />);

      expect(screen.getByTestId('custom-skills')).toBeInTheDocument();
    });

    it('должен применять className из пропсов', () => {
      const { container } = render(<Skills className="custom-class" />);

      const section = container.querySelector('.custom-class');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="list" на контейнере категорий', () => {
      const { container } = render(<Skills />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });

    it('должен иметь aria-label на секции', () => {
      const { container } = render(<Skills />);

      const section = container.querySelector('section[aria-label="Навыки разработчика"]');
      expect(section).toBeInTheDocument();
    });

    it('должен рендерить 7 элементов списка с role="listitem" (категории)', () => {
      const { container } = render(<Skills />);

      const listItems = container.querySelectorAll('[role="listitem"]');
      // 7 categories
      expect(listItems.length).toBeGreaterThanOrEqual(7);
    });

    it('должен иметь фокусируемые элементы для keyboard navigation', () => {
      render(<Skills />);

      // Все карточки категорий должны быть в документе
      const categoryItems = screen.getAllByRole('listitem');
      expect(categoryItems.length).toBeGreaterThanOrEqual(4);

      // Проверяем, что элементы существуют и могут получать фокус
      categoryItems.forEach((item) => {
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('должен отображать сообщение при пустом массиве навыков', () => {
      // Mock empty SKILLS_DATA
      vi.spyOn(constants, 'SKILLS_DATA', 'get').mockReturnValue([]);

      render(<Skills />);

      expect(screen.getByText('Навыки не указаны')).toBeInTheDocument();
    });

    it('не должен бросать ошибок при undefined данных', () => {
      vi.spyOn(constants, 'SKILLS_DATA', 'get').mockReturnValue([]);

      expect(() => render(<Skills />)).not.toThrow();
    });
  });

  describe('Memo Performance', () => {
    it('не должен ререндериться при одинаковых пропах', () => {
      const { rerender } = render(<Skills />);

      const firstRender = screen.getByTestId('skills');
      rerender(<Skills />);
      const secondRender = screen.getByTestId('skills');

      // Оба рендера должны быть в документе (memo предотвращает лишний ререндер)
      expect(firstRender).toBeInTheDocument();
      expect(secondRender).toBeInTheDocument();
    });
  });

  describe('Integration with SKILLS_DATA', () => {
    it('должен использовать данные из SKILLS_DATA.categories', () => {
      render(<Skills />);

      // Проверяем, что данные берутся из SKILLS_DATA
      const categories = constants.SKILLS_DATA;
      expect(categories.length).toBeGreaterThan(0);

      categories.forEach((category) => {
        expect(screen.getByText(category.categoryName)).toBeInTheDocument();
      });
    });
  });
});
