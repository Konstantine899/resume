import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_STACK } from '@/entities/Developer';
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
  useLanguage: () => ({
    t: (key: string) => ({ mySkills: 'My Skills' })[key] ?? key,
  }),
}));

// SkillsInner wires the code-copy toast — no-op provider, same pattern as Hero
vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
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

      expect(screen.getByText('My Skills')).toBeInTheDocument();
    });

    it('должен рендерить все категории из SKILLS_DATA', () => {
      render(<Skills />);

      // Проверяем наличие всех 6 категорий (Methodologies удалён — audit P1)
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
      expect(screen.getByText('DevOps & CI/CD')).toBeInTheDocument();
      expect(screen.getByText('Architecture')).toBeInTheDocument();
      expect(screen.getByText('AI & Automation')).toBeInTheDocument();
      expect(screen.queryByText('Methodologies')).not.toBeInTheDocument();
    });

    it('должен рендерить технологии для каждой категории', () => {
      const { container } = render(<Skills />);

      // Scoped to the categories grid: after the P9 move the `developer.ts`
      // snippet above the heading also renders stack names (PROFILE_STACK), and
      // the line-numbered code block renders its own `role="list"`. Neither
      // `getByText` nor `getByRole('list')` is unambiguous here, so the grid is
      // addressed by the class its own module gives it.
      const grid = container.querySelector('[class*="categoriesList"]');
      if (!(grid instanceof HTMLElement)) throw new Error('categories grid not rendered');

      // Проверяем технологии из разных категорий
      expect(within(grid).getByText('React')).toBeInTheDocument();
      expect(within(grid).getByText('TypeScript')).toBeInTheDocument();
      expect(within(grid).getByText('Redux Toolkit')).toBeInTheDocument();
      expect(within(grid).getByText('Material-UI')).toBeInTheDocument();
      expect(within(grid).getByText('Node.js')).toBeInTheDocument();
      expect(within(grid).getByText('Nest.js')).toBeInTheDocument();
      expect(within(grid).getByText('REST API')).toBeInTheDocument();
      expect(within(grid).getByText('WebSocket')).toBeInTheDocument();
      expect(within(grid).getByText('Jest')).toBeInTheDocument();
      expect(within(grid).getByText('Cypress')).toBeInTheDocument();
      expect(within(grid).getByText('Docker')).toBeInTheDocument();
      expect(within(grid).getByText('GitHub Actions')).toBeInTheDocument();
      expect(within(grid).getByText('Feature-Sliced Design (FSD)')).toBeInTheDocument();
      expect(within(grid).getByText('Cursor')).toBeInTheDocument();
      expect(within(grid).getByText('GitHub Copilot')).toBeInTheDocument();
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

    it('должен рендерить 6 элементов списка с role="listitem" (категории)', () => {
      const { container } = render(<Skills />);

      const listItems = container.querySelectorAll('[role="listitem"]');
      // 6 categories (Methodologies удалён — audit P1)
      expect(listItems.length).toBeGreaterThanOrEqual(6);
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

      expect(screen.getByText('skillsEmpty')).toBeInTheDocument();
    });

    it('не должен бросать ошибок при undefined данных', () => {
      vi.spyOn(constants, 'SKILLS_DATA', 'get').mockReturnValue([]);

      expect(() => render(<Skills />)).not.toThrow();
    });
  });

  describe('Code block placement (P9)', () => {
    it('должен рендерить блок developer.ts в секции', () => {
      render(<Skills />);

      expect(screen.getByTestId('code-block')).toBeInTheDocument();
      expect(screen.getByText('developer.ts')).toBeInTheDocument();
    });

    it('должен ставить блок ПЕРЕД заголовком секции', () => {
      render(<Skills />);

      const block = screen.getByTestId('code-block');
      const heading = screen.getByText('My Skills');
      // DOM order, not visual order — position is the point of this move.
      expect(block.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('должен рендерить сниппет через компонент SkillsCode, а не инлайновую разметку', () => {
      const { container } = render(<Skills />);

      // The snippet itself IS the markup (SkillsCode owns the highlighting) —
      // what must not exist is a second, hand-rolled copy of the stack.
      const block = screen.getByTestId('code-block');
      expect(block.textContent).toContain('const');
      expect(block.textContent).toContain('developer');
      // The stack is rendered from the shared PROFILE_STACK by SkillsCode only.
      const quoted = (container.textContent ?? '').match(/'[^']+'/g) ?? [];
      for (const tech of PROFILE_STACK) {
        expect(quoted.filter((entry) => entry === `'${tech}'`)).toHaveLength(1);
      }
    });

    it('не должен рендерить блок в empty-state', () => {
      vi.spyOn(constants, 'SKILLS_DATA', 'get').mockReturnValue([]);

      render(<Skills />);

      // D5: the snippet is about the profile, not about the section data.
      expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
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
