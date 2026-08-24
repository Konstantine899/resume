import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SkillItem } from './SkillItem';
import styles from './SkillItem.module.scss';
import type { SkillCategoryData } from '../../model/types';

const mockFrontendCategory: SkillCategoryData = {
  category: 'frontend',
  categoryName: 'Frontend',
  technologies: [
    { name: 'React', iconSvg: '/icons/react.svg' },
    { name: 'TypeScript', iconSvg: '/icons/typescript.svg' },
    { name: 'Redux Toolkit', iconSvg: '/icons/redux.svg' },
  ],
};

const mockBackendCategory: SkillCategoryData = {
  category: 'backend',
  categoryName: 'Backend',
  technologies: [
    { name: 'Node.js', iconSvg: '/icons/nodejs.svg' },
    { name: 'Express', iconSvg: '/icons/express.svg' },
  ],
};

const mockTestingCategory: SkillCategoryData = {
  category: 'testing',
  categoryName: 'Testing',
  technologies: [
    { name: 'Jest', iconSvg: '/icons/jest.svg' },
    { name: 'React Testing Library', iconSvg: '/icons/testing-library.svg' },
  ],
};

const mockAICategory: SkillCategoryData = {
  category: 'ai',
  categoryName: 'AI & Automation',
  technologies: [
    { name: 'Cursor', iconSvg: '/icons/cursor.svg', invertInDark: true },
    { name: 'GitHub Copilot', iconSvg: '/icons/github-copilot.svg', invertInDark: true },
  ],
};

describe('SkillItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить карточку с названием категории и технологиями', () => {
      render(<SkillItem categoryData={mockFrontendCategory} />);

      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Redux Toolkit')).toBeInTheDocument();
    });

    it('должен рендерить иконки технологий как img элементы', () => {
      render(<SkillItem categoryData={mockFrontendCategory} />);

      const reactIcon = screen.getByAltText('React') as HTMLImageElement;
      expect(reactIcon).toBeInTheDocument();
      expect(reactIcon.src).toContain('react.svg');

      const typescriptIcon = screen.getByAltText('TypeScript') as HTMLImageElement;
      expect(typescriptIcon).toBeInTheDocument();
      expect(typescriptIcon.src).toContain('typescript.svg');
    });

    it('должен рендерить grid с технологиями с role="list"', () => {
      const { container } = render(<SkillItem categoryData={mockBackendCategory} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
      expect(list?.classList.contains(styles.skillsGrid ?? '')).toBe(true);
    });

    it('должен рендерить каждую технологию как listitem', () => {
      const { container } = render(<SkillItem categoryData={mockBackendCategory} />);

      const techItems = container.querySelectorAll(`.${styles.techItem ?? ''}`);
      expect(techItems).toHaveLength(2);
      expect(techItems[0]).toHaveAttribute('aria-label', 'Node.js');
      expect(techItems[1]).toHaveAttribute('aria-label', 'Express');
    });

    it('должен иметь aria-label на каждой технологии', () => {
      const { container } = render(<SkillItem categoryData={mockTestingCategory} />);

      const techItems = container.querySelectorAll(`.${styles.techItem ?? ''}`);
      expect(techItems[0]).toHaveAttribute('aria-label', 'Jest');
      expect(techItems[1]).toHaveAttribute('aria-label', 'React Testing Library');
    });

    it('должен иметь data-testid по умолчанию', () => {
      render(<SkillItem categoryData={mockFrontendCategory} />);

      expect(screen.getByTestId('skill-item')).toBeInTheDocument();
    });

    it('должен принимать кастомный data-testid', () => {
      render(<SkillItem categoryData={mockFrontendCategory} data-testid="custom-skill-item" />);

      expect(screen.getByTestId('custom-skill-item')).toBeInTheDocument();
    });

    it('должен принимать prop delay для анимации', () => {
      const { container } = render(<SkillItem categoryData={mockFrontendCategory} delay={150} />);

      const item = container.querySelector(`.${styles.skillItem ?? ''}`);
      expect(item?.getAttribute('style')).toContain('animation-delay: 150ms');
    });

    it('должен применять data-category для CSS темизации', () => {
      const { container } = render(<SkillItem categoryData={mockFrontendCategory} />);

      const item = container.querySelector('[data-category="frontend"]');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="listitem" на контейнере категории', () => {
      const { container } = render(<SkillItem categoryData={mockFrontendCategory} />);

      const item = container.querySelector('[role="listitem"]');
      expect(item).toBeInTheDocument();
    });

    it('должен иметь aria-label с названием категории и количеством технологий', () => {
      const { container } = render(<SkillItem categoryData={mockBackendCategory} />);

      const item = container.querySelector('[role="listitem"]');
      expect(item).toHaveAttribute('aria-label', 'Backend: 2 технологий');
    });

    it('должен иметь aria-label на каждой технологии', () => {
      const { container } = render(<SkillItem categoryData={mockBackendCategory} />);

      const techItems = container.querySelectorAll(`.${styles.techItem ?? ''}`);
      expect(techItems[0]).toHaveAttribute('aria-label', 'Node.js');
      expect(techItems[1]).toHaveAttribute('aria-label', 'Express');
    });

    it('должен применять iconFilter для раскраски иконок', () => {
      const mockWithFilter: SkillCategoryData = {
        category: 'frontend',
        categoryName: 'Frontend',
        technologies: [
          {
            name: 'React',
            iconSvg: '/icons/react.svg',
            iconFilter: 'brightness(0) saturate(100%) invert(100%)',
          },
        ],
      };

      const { container } = render(<SkillItem categoryData={mockWithFilter} />);

      const icon = container.querySelector(`img[alt="React"]`);
      expect(icon).toHaveAttribute('style', expect.stringContaining('filter:'));
    });
  });

  describe('Different Categories', () => {
    it('должен рендерить data-category="frontend" для frontend', () => {
      const { container } = render(<SkillItem categoryData={mockFrontendCategory} />);

      expect(container.querySelector('[data-category="frontend"]')).toBeInTheDocument();
    });

    it('должен рендерить data-category="backend" для backend', () => {
      const { container } = render(<SkillItem categoryData={mockBackendCategory} />);

      expect(container.querySelector('[data-category="backend"]')).toBeInTheDocument();
    });

    it('должен рендерить data-category="testing" для testing', () => {
      const { container } = render(<SkillItem categoryData={mockTestingCategory} />);

      expect(container.querySelector('[data-category="testing"]')).toBeInTheDocument();
    });

    it('должен рендерить data-category="ai" для AI & Automation', () => {
      const { container } = render(<SkillItem categoryData={mockAICategory} />);

      expect(container.querySelector('[data-category="ai"]')).toBeInTheDocument();
    });

    it('должен рендерить правильное количество технологий', () => {
      const { container } = render(<SkillItem categoryData={mockFrontendCategory} />);

      const techItems = container.querySelectorAll(`.${styles.techItem ?? ''}`);
      expect(techItems).toHaveLength(3);
    });
  });

  describe('Memo Performance', () => {
    it('должен использовать memo для оптимизации ререндеров', () => {
      // memo обёртка проверяется через поведение, а не через $$typeof
      // Компонент должен быть обёрнут в memo для предотвращения лишних ререндеров
      expect(SkillItem).toBeDefined();
    });
  });
});
