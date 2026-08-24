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

  // Helper: get the <label> element inside the group
  const getLabelElement = () => {
    const group = screen.getByRole('group');
    return group.querySelector('label');
  };

  describe('Rendering', () => {
    it('должен рендерить children текст', () => {
      render(<Label htmlFor="test">Email Address</Label>);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('должен применять wrapper класс', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);
      expect(container.firstChild).toHaveClass(styles.wrapper ?? '');
    });

    it('должен применять label класс', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(getLabelElement()).toHaveClass(styles.label ?? '');
    });

    it('должен применять custom className', () => {
      render(
        <Label htmlFor="test" className="custom-class">
          Label
        </Label>
      );
      expect(getLabelElement()).toHaveClass('custom-class');
    });

    it('должен применять htmlFor атрибут', () => {
      render(<Label htmlFor="email">Email</Label>);
      expect(getLabelElement()?.getAttribute('for')).toBe('email');
    });
  });

  describe('Size Variants', () => {
    it('должен применять sm размер', () => {
      render(
        <Label htmlFor="test" size="sm">
          Small
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.sm ?? '');
    });

    it('должен применять md размер по умолчанию', () => {
      render(<Label htmlFor="test">Medium</Label>);
      expect(getLabelElement()).toHaveClass(styles.md ?? '');
    });

    it('должен применять lg размер', () => {
      render(
        <Label htmlFor="test" size="lg">
          Large
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.lg ?? '');
    });
  });

  describe('Visual Variants', () => {
    it('должен применять error variant', () => {
      render(
        <Label htmlFor="test" error>
          Error Label
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.error ?? '');
    });

    it('должен применять success variant', () => {
      render(
        <Label htmlFor="test" success>
          Success Label
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.success ?? '');
    });

    it('должен применять warning variant', () => {
      render(
        <Label htmlFor="test" variant="warning">
          Warning Label
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.warning ?? '');
    });

    it('error должен иметь приоритет над success', () => {
      render(
        <Label htmlFor="test" error success>
          Priority Test
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.error ?? '');
      expect(getLabelElement()).not.toHaveClass(styles.success ?? '');
    });

    it('error должен иметь приоритет над variant', () => {
      render(
        <Label htmlFor="test" error variant="warning">
          Priority Test
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.error ?? '');
      expect(getLabelElement()).not.toHaveClass(styles.warning ?? '');
    });
  });

  describe('Required State', () => {
    it('должен применять required класс', () => {
      render(
        <Label htmlFor="test" required>
          Required
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.required ?? '');
    });

    it('должен устанавливать data-required атрибут', () => {
      render(
        <Label htmlFor="test" required>
          Required
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-required');
    });

    it('не должен устанавливать data-required когда required=false', () => {
      render(
        <Label htmlFor="test" required={false}>
          Not Required
        </Label>
      );
      expect(getLabelElement()).not.toHaveAttribute('data-required');
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

    it('должен рендерить description через Paragraph', () => {
      render(
        <Label htmlFor="password" description="Description text">
          Password
        </Label>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
      expect(screen.getByText('Description text').tagName).toBe('SPAN');
    });

    it('должен устанавливать правильный id для description', () => {
      const { container } = render(
        <Label htmlFor="email" description="Enter your email">
          Email
        </Label>
      );
      expect(container.querySelector('#email-description')).toBeInTheDocument();
    });

    it('должен применять aria-describedby на label (не на wrapper)', () => {
      render(
        <Label htmlFor="email" description="Enter your email">
          Email
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('aria-describedby', 'email-description');
      expect(screen.getByRole('group')).not.toHaveAttribute('aria-describedby');
    });

    it('не должен рендерить description когда не указан', () => {
      const { container } = render(<Label htmlFor="test">Label</Label>);
      expect(container.querySelector(`.${styles.description ?? ''}`)).not.toBeInTheDocument();
    });

    it('не должен устанавливать aria-describedby когда нет description', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(screen.getByRole('group')).not.toHaveAttribute('aria-describedby');
    });

    it('должен генерировать уникальный id для description когда htmlFor не задан', () => {
      render(<Label description="Helper text">No For</Label>);
      const describedBy = getLabelElement()?.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="group" на wrapper', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(screen.getByRole('group')).toBeInTheDocument();
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
      render(
        <Label htmlFor="test" error>
          Error
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-error');
    });

    it('должен устанавливать data-success атрибут', () => {
      render(
        <Label htmlFor="test" success>
          Success
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-success');
    });

    it('должен устанавливать data-size атрибут', () => {
      render(
        <Label htmlFor="test" size="lg">
          Large
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-size', 'lg');
    });

    it('должен устанавливать data-variant атрибут', () => {
      render(
        <Label htmlFor="test" variant="warning">
          Warning
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-variant', 'warning');
    });

    it('должен устанавливать data-skeleton атрибут при skeleton=true', () => {
      render(
        <Label htmlFor="test" skeleton>
          Loading
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('data-skeleton');
    });

    it('должен устанавливать aria-busy при skeleton=true', () => {
      render(
        <Label htmlFor="test" skeleton>
          Loading
        </Label>
      );
      expect(getLabelElement()).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Skeleton Mode', () => {
    it('должен рендерить Skeleton при skeleton=true', () => {
      render(
        <Label htmlFor="test" skeleton>
          Hidden Text
        </Label>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('не должен показывать текст при skeleton=true', () => {
      render(
        <Label htmlFor="test" skeleton>
          Hidden Text
        </Label>
      );
      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('должен показывать текст при skeleton=false', () => {
      render(
        <Label htmlFor="test" skeleton={false}>
          Visible Text
        </Label>
      );
      expect(screen.getByText('Visible Text')).toBeInTheDocument();
    });

    it('должен применять skeletonMode класс', () => {
      render(
        <Label htmlFor="test" skeleton>
          Loading
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.skeletonMode ?? '');
    });

    it('не должен применять skeletonMode класс при skeleton=false', () => {
      render(<Label htmlFor="test">Normal</Label>);
      expect(getLabelElement()).not.toHaveClass(styles.skeletonMode ?? '');
    });
  });

  describe('Dev Warnings', () => {
    it('не должен предупреждать об отсутствии htmlFor (теперь опционален)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<Label>Label without htmlFor</Label>);

      expect(warnSpy).not.toHaveBeenCalled();

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
      render(
        <Label htmlFor="test" error={false}>
          Label
        </Label>
      );
      expect(getLabelElement()).not.toHaveAttribute('data-error');
    });

    it('не должен устанавливать data-success когда success=false', () => {
      render(
        <Label htmlFor="test" success={false}>
          Label
        </Label>
      );
      expect(getLabelElement()).not.toHaveAttribute('data-success');
    });
  });

  describe('Default Props', () => {
    it('должен использовать md размер по умолчанию', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(getLabelElement()).toHaveClass(styles.md ?? '');
    });

    it('должен использовать default variant по умолчанию', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(getLabelElement()).toHaveClass(styles.default ?? '');
    });

    it('должен использовать required=false по умолчанию', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(getLabelElement()).not.toHaveClass(styles.required ?? '');
    });

    it('должен использовать skeleton=false по умолчанию', () => {
      render(<Label htmlFor="test">Label</Label>);
      expect(getLabelElement()).not.toHaveAttribute('data-skeleton');
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Label.displayName).toBe('Label');
    });
  });

  describe('asChild', () => {
    it('должен рендерить дочерний элемент через Slot без wrapper', () => {
      const { container } = render(
        <Label asChild htmlFor="test">
          <span>Child Label</span>
        </Label>
      );
      expect(screen.getByText('Child Label').tagName).toBe('SPAN');
      expect(container.querySelector('label')).toBeNull();
      expect(screen.queryByRole('group')).toBeNull();
    });

    it('должен мержить className на дочерний элемент', () => {
      render(
        <Label asChild className="extra" htmlFor="test">
          <span>Child</span>
        </Label>
      );
      const child = screen.getByText('Child');
      expect(child).toHaveClass(styles.label ?? '');
      expect(child).toHaveClass('extra');
    });

    it('должен пробрасывать ref на дочерний элемент', () => {
      const ref = vi.fn();
      render(
        <Label asChild ref={ref as unknown as React.Ref<HTMLLabelElement>} htmlFor="test">
          <span>Child</span>
        </Label>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('inline', () => {
    it('не должен рендерить wrapper div', () => {
      const { container } = render(
        <Label inline htmlFor="test">
          Inline
        </Label>
      );
      expect(container.firstChild?.nodeName).toBe('LABEL');
      expect(screen.queryByRole('group')).toBeNull();
    });

    it('должен рендерить description без wrapper', () => {
      const { container } = render(
        <Label inline htmlFor="email" description="Helper">
          Email
        </Label>
      );
      expect(screen.getByText('Helper').tagName).toBe('SPAN');
      expect(container.firstChild?.nodeName).toBe('LABEL');
    });
  });

  describe('floating', () => {
    it('должен применять floating класс', () => {
      render(
        <Label floating htmlFor="test">
          Floating
        </Label>
      );
      expect(getLabelElement()).toHaveClass(styles.floating ?? '');
    });
  });

  describe('htmlFor optional', () => {
    it('не должен устанавливать атрибут for когда htmlFor не задан', () => {
      render(<Label>Label</Label>);
      expect(getLabelElement()).not.toHaveAttribute('for');
    });
  });
});
