import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { resolveCssModuleKey } from '@/shared/lib/utils';
import { Badge } from './Badge';
import badgeStyles from './Badge.module.scss';

describe('Badge', () => {
  // ============================================
  // Rendering
  // ============================================
  describe('Rendering', () => {
    it('renders with basic props', () => {
      render(<Badge>12</Badge>);

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('12')).toHaveClass(resolveCssModuleKey(badgeStyles, 'badge'));
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);

      expect(screen.getByText('Badge')).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(<Badge>Badge text</Badge>);

      expect(screen.getByText('Badge text')).toBeInTheDocument();
    });

    it('has role="status" by default for success/warning/error', () => {
      render(<Badge variant="success">Active</Badge>);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not have role="status" for default/accent/outline', () => {
      render(<Badge variant="default">Default</Badge>);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Variants
  // ============================================
  describe('Variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'accent', 'outline'] as const;

    variants.forEach((variant) => {
      it(`renders with variant="${variant}"`, () => {
        render(<Badge variant={variant}>Badge</Badge>);

        expect(screen.getByText('Badge')).toHaveClass(resolveCssModuleKey(badgeStyles, variant));
      });
    });

    it('variant="outline" does not have background', () => {
      render(<Badge variant="outline">Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass(resolveCssModuleKey(badgeStyles, 'outline'));
      expect(badge).not.toHaveClass(resolveCssModuleKey(badgeStyles, 'default'));
    });
  });

  // ============================================
  // Sizes
  // ============================================
  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`renders with size="${size}"`, () => {
        render(<Badge size={size}>Badge</Badge>);

        expect(screen.getByText('Badge')).toHaveClass(resolveCssModuleKey(badgeStyles, size));
      });
    });
  });

  // ============================================
  // States
  // ============================================
  describe('States', () => {
    it('is disabled when disabled=true', () => {
      render(<Badge disabled>Disabled</Badge>);

      const badge = screen.getByText('Disabled');
      expect(badge).toHaveAttribute('aria-disabled', 'true');
    });

    it('is not disabled by default', () => {
      render(<Badge>Enabled</Badge>);

      const badge = screen.getByText('Enabled');
      expect(badge).not.toHaveAttribute('aria-disabled');
    });
  });

  // ============================================
  // Accessibility
  // ============================================
  describe('Accessibility', () => {
    it('has role="status" for variant="success"', () => {
      render(<Badge variant="success">Active</Badge>);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has role="status" for variant="warning"', () => {
      render(<Badge variant="warning">Pending</Badge>);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has role="status" for variant="error"', () => {
      render(<Badge variant="error">Error</Badge>);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not have role="status" for variant="default"', () => {
      render(<Badge variant="default">Default</Badge>);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('accepts custom aria-label', () => {
      render(
        <Badge variant="success" aria-label="User status">
          Online
        </Badge>
      );

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'User status');
    });

    it('auto-generates aria-label for success', () => {
      render(<Badge variant="success">Active</Badge>);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Badge: success');
    });

    it('auto-generates aria-label for warning', () => {
      render(<Badge variant="warning">Pending</Badge>);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Badge: warning');
    });

    it('auto-generates aria-label for error', () => {
      render(<Badge variant="error">Error</Badge>);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Badge: error');
    });

    it('sets aria-disabled when disabled', () => {
      render(<Badge disabled>Disabled</Badge>);

      expect(screen.getByText('Disabled')).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not set aria-disabled when not disabled', () => {
      render(<Badge>Enabled</Badge>);

      expect(screen.getByText('Enabled')).not.toHaveAttribute('aria-disabled');
    });
  });
});
