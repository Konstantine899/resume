// src/shared/ui/Link/ui/Link.polymorphic.test.tsx
//
// TDD RED/GREEN suite for LNK-01/LNK-02/LNK-08/LNK-16:
// generic `component` prop, type-safe ref forwarding, compile-time probes.
// Written BEFORE the polymorphic implementation (RED): the custom-component
// tests fail against the closed-typed Link, and `component` is not a valid
// prop yet, so `type-check:strict` fails on this file until LNK-01 lands.

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from './Link';
import linkStyles from './Link.module.scss';

interface CustomLinkProps {
  className?: string;
  href?: string;
  children?: ReactNode;
}

/**
 * Stand-in for a router link (e.g. react-router Link): receives the merged
 * className and forwards the anchor props onto its own <a> element.
 */
const CustomComp = ({
  className,
  href,
  children,
  ...rest
}: CustomLinkProps & Record<string, unknown>) => (
  <a href={href} className={className} data-testid="custom-link" {...rest}>
    {children}
  </a>
);

describe('Link polymorphic `component` prop', () => {
  describe('rendering as an element', () => {
    it('should render as an <a> with href when component="a"', () => {
      render(
        <Link component="a" href="/about">
          About
        </Link>
      );

      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should forward element-specific props for component="a"', () => {
      render(
        <Link component="a" href="/file.pdf" download>
          Download
        </Link>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/file.pdf');
      expect(link).toHaveAttribute('download');
    });

    it('should preserve link classes and consumer className', () => {
      render(
        <Link component="a" href="/about" variant="gradient" size="lg" className="custom-class">
          About
        </Link>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass(linkStyles.link ?? '');
      expect(link).toHaveClass(linkStyles.gradient ?? '');
      expect(link).toHaveClass(linkStyles.lg ?? '');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('rendering as a custom component', () => {
    it('should render the custom component and pass the merged className', () => {
      render(
        <Link component={CustomComp} href="/x" className="custom-class">
          Go
        </Link>
      );

      const link = screen.getByTestId('custom-link');
      expect(link.tagName).toBe('A');
      expect(link).toHaveClass(linkStyles.link ?? '');
      expect(link).toHaveClass('custom-class');
    });

    it('should forward href and children to the custom component', () => {
      render(
        <Link component={CustomComp} href="/x">
          Go
        </Link>
      );

      const link = screen.getByTestId('custom-link');
      expect(link).toHaveAttribute('href', '/x');
      expect(link).toHaveTextContent('Go');
    });

    it('should apply data attributes on the custom component element', () => {
      render(
        <Link component={CustomComp} href="/x" variant="secondary" size="sm">
          Go
        </Link>
      );

      const link = screen.getByTestId('custom-link');
      expect(link).toHaveAttribute('data-variant', 'secondary');
      expect(link).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('type-safe refs', () => {
    it('should resolve ref.current to HTMLAnchorElement when component="a"', () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Link component="a" href="/about" ref={ref}>
          About
        </Link>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('compile-time type probes', () => {
    it('should reject button-only attributes on component="a"', () => {
      // @ts-expect-error — `disabled` is not a valid anchor attribute
      <Link component="a" href="/about" disabled>
        About
      </Link>;
    });

    it('should reject anchor-only attributes on component="button"', () => {
      // @ts-expect-error — `download` is not a valid button attribute
      <Link component="button" href="/about" download>
        About
      </Link>;
    });

    it('should accept valid href on component="button"', () => {
      // href is a LinkOwnProps prop and stays valid for any component
      <Link component="button" href="/about">
        About
      </Link>;
    });
  });

  describe('a11y (LNK-17)', () => {
    it('should expose a link role and be focusable via keyboard', () => {
      render(
        <Link component="a" href="/about" data-testid="a11y-link">
          About
        </Link>
      );

      const link = screen.getByRole('link', { name: 'About' });
      // Anchor is focusable (not disabled) — tabindex resolves to 0
      expect(link.tabIndex).toBe(0);
      link.focus();
      expect(link).toHaveFocus();
    });

    it('should label the external icon with an accessible name', () => {
      render(
        <Link component="a" href="https://github.com" external showExternalIcon>
          GitHub
        </Link>
      );

      const icon = screen
        .getAllByRole('link', { name: /GitHub/ })[0]
        ?.querySelector('[aria-label="Opens in new tab"]');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('aria-label', 'Opens in new tab');
      expect(icon).toHaveAttribute('title', 'Opens in new tab');
    });

    it('should be keyboard-focusable as a skip link in a consumer context', () => {
      render(
        <Link component="a" href="#main-content" className="skip-link">
          Skip to content
        </Link>
      );

      const skip = screen.getByRole('link', { name: 'Skip to content' });
      expect(skip).toHaveAttribute('href', '#main-content');
      expect(skip).toHaveAttribute('class', expect.stringContaining('skip-link'));
      skip.focus();
      expect(skip).toHaveFocus();
    });
  });
});
