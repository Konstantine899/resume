import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';
import styles from './Label.module.scss';

describe('Label', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить children текст', () => {
      render(<Label htmlFor="test">Email Address</Label>);

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('должен применять wrapper класс', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.firstChild).toHaveClass(styles.wrapper);
    });

    it('должен применять label класс', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.querySelector('label')).toHaveClass(styles.label);
    });

    it('должен применять custom className', () => {
      const { container } = render(
        <Label htmlFor="test" className="custom-class">
          Label
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass('custom-class');
    });

    it('должен применять htmlFor атрибут', () => {
      const { container } = render(<Label htmlFor="email">Email</Label>);

      const label = container.querySelector('label');
      expect(label?.getAttribute('for')).toBe('email');
    });
  });

  describe('Size Variants', () => {
    it('должен применять sm размер', () => {
      const { container } = render(
        <Label htmlFor="test" size="sm">
          Small
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.sm);
    });

    it('должен применять md размер по умолчанию', () => {
      const { container } = render(<Label htmlFor="test">Medium</Label>);

      expect(container.querySelector('label')).toHaveClass(styles.md);
    });

    it('должен применять lg размер', () => {
      const { container } = render(
        <Label htmlFor="test" size="lg">
          Large
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.lg);
    });
  });

  describe('Visual Variants', () => {
    it('должен применять error variant', () => {
      const { container } = render(
        <Label htmlFor="test" error>
          Error Label
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.error);
    });

    it('должен применять success variant', () => {
      const { container } = render(
        <Label htmlFor="test" success>
          Success Label
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.success);
    });

    it('должен применять warning variant', () => {
      const { container } = render(
        <Label htmlFor="test" variant="warning">
          Warning Label
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.warning);
    });

    it('error должен иметь приоритет над success', () => {
      const { container } = render(
        <Label htmlFor="test" error success>
          Priority Test
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.error);
      expect(container.querySelector('label')).not.toHaveClass(styles.success);
    });

    it('error должен иметь приоритет над variant', () => {
      const { container } = render(
        <Label htmlFor="test" error variant="warning">
          Priority Test
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.error);
      expect(container.querySelector('label')).not.toHaveClass(styles.warning);
    });
  });

  describe('Required State', () => {
    it('должен применять required класс', () => {
      const { container } = render(
        <Label htmlFor="test" required>
          Required
        </Label>
      );

      expect(container.querySelector('label')).toHaveClass(styles.required);
    });

    it('должен устанавливать data-required атрибут', () => {
      const { container } = render(
        <Label htmlFor="test" required>
          Required
        </Label>
      );

      expect(container.querySelector('label')).toHaveAttribute('data-required');
    });

    it('не должен устанавливать data-required когда required=false', () => {
      const { container } = render(
        <Label htmlFor="test" required={false}>
          Not Required
        </Label>
      );

      expect(container.querySelector('label')).not.toHaveAttribute('data-required');
    });
  });

  describe('Description', () => {
    it('должен рендерить description текст', () => {
      render(
        <Label htmlFor="password" description="Must be at least 8 characters">
          Password
        </Label>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('должен применять description класс', () => {
      const { container } = render(
        <Label htmlFor="password" description="Description text">
          Password
        </Label>
      );

      expect(container.querySelector(`.${styles.description}`)).toBeInTheDocument();
    });

    it('должен устанавливать правильный id для description', () => {
      const { container } = render(
        <Label htmlFor="email" description="Enter your email">
          Email
        </Label>
      );

      expect(container.querySelector('#email-description')).toBeInTheDocument();
    });

    it('должен применять aria-describedby на wrapper', () => {
      const { container } = render(
        <Label htmlFor="email" description="Enter your email">
          Email
        </Label>
      );

      expect(container.firstChild).toHaveAttribute('aria-describedby', 'email-description');
    });

    it('не должен рендерить description когда не указан', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.querySelector(`.${styles.description}`)).not.toBeInTheDocument();
    });

    it('не должен устанавливать aria-describedby когда нет description', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.firstChild).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="group" на wrapper', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.firstChild).toHaveAttribute('role', 'group');
    });

    it('должен пробрасывать ref на label элемент', () => {
      const ref = vi.fn();
      render(
        <Label htmlFor="test" ref={ref as unknown as React.Ref<HTMLLabelElement>}>
          Label
        </Label>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLLabelElement));
    });

    it('должен устанавливать data-error атрибут', () => {
      const { container } = render(
        <Label htmlFor="test" error>
          Error
        </Label>
      );

      expect(container.querySelector('label')).toHaveAttribute('data-error');
    });

    it('должен устанавливать data-success атрибут', () => {
      const { container } = render(
        <Label htmlFor="test" success>
          Success
        </Label>
      );

      expect(container.querySelector('label')).toHaveAttribute('data-success');
    });
  });

  describe('Dev Warnings', () => {
    it('должен предупреждать об отсутствии htmlFor в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<Label htmlFor="">Label</Label>);

      expect(warnSpy).toHaveBeenCalledWith('Label: htmlFor prop is required for accessibility');

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('должен предупреждать о конфликте error+success в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <Label htmlFor="test" error success>
          Label
        </Label>
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'Label: cannot have both error and success props simultaneously'
      );

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен предупреждать в production режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <Label htmlFor="" error success>
          Label
        </Label>
      );

      expect(warnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });
  });

  describe('State Attributes', () => {
    it('не должен устанавливать data-error когда error=false', () => {
      const { container } = render(
        <Label htmlFor="test" error={false}>
          Label
        </Label>
      );

      expect(container.querySelector('label')).not.toHaveAttribute('data-error');
    });

    it('не должен устанавливать data-success когда success=false', () => {
      const { container } = render(
        <Label htmlFor="test" success={false}>
          Label
        </Label>
      );

      expect(container.querySelector('label')).not.toHaveAttribute('data-success');
    });
  });

  describe('Default Props', () => {
    it('должен использовать md размер по умолчанию', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.querySelector('label')).toHaveClass(styles.md);
    });

    it('должен использовать default variant по умолчанию', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.querySelector('label')).toHaveClass(styles.default);
    });

    it('должен использовать required=false по умолчанию', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);

      expect(container.querySelector('label')).not.toHaveClass(styles.required);
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Label.displayName).toBe('Label');
    });
  });
});
