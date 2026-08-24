// src/shared/ui/Skeleton/ui/Skeleton.polymorphic.test.tsx
// Polymorphic 'as' prop tests (SKL-04) — GREEN after types + impl

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton — Polymorphic as prop', () => {
  describe('Polymorphic rendering', () => {
    it('renders as div by default', () => {
      render(<Skeleton ratio="16/9" />);
      const element = screen.getByRole('status');
      expect(element.tagName).toBe('DIV');
    });

    it('renders as article with element props', () => {
      render(<Skeleton as="article" ratio="4/3" title="Test article" />);
      const element = screen.getByRole('status');
      expect(element.tagName).toBe('ARTICLE');
      expect(element).toHaveAttribute('title', 'Test article');
      expect(element).toHaveAttribute('data-as', 'article');
    });

    it('custom component receives merged props', () => {
      const CustomBox = ({ className, children, ...rest }: React.ComponentProps<'div'>) => (
        <div data-custom="true" className={className} {...rest}>
          {children}
        </div>
      );
      render(<Skeleton as={CustomBox} ratio="1/1" aria-label="custom" />);
      const element = screen.getByLabelText('custom');
      expect(element).toHaveAttribute('data-custom', 'true');
    });

    it('data-as absent on default div', () => {
      render(<Skeleton ratio="16/9" />);
      const element = screen.getByRole('status');
      expect(element).not.toHaveAttribute('data-as');
    });
  });

  describe('Ref per as', () => {
    it('default ref is HTMLDivElement', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Skeleton ref={ref} ratio="16/9" data-testid="skeleton-ref" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('as="article" ref resolves to article element', () => {
      const ref = React.createRef<HTMLElement>();
      render(<Skeleton as="article" ref={ref} ratio="4/3" data-testid="skeleton-ref" />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe('ARTICLE');
    });
  });

  describe('@ts-expect-error compile probes', () => {
    it('rejects href on div', () => {
      // @ts-expect-error — href is not valid on div
      render(<Skeleton as="div" ratio="16/9" href="/x" />);
    });

    it('accepts href on anchor', () => {
      // This should compile — anchor accepts href
      render(<Skeleton as="a" ratio="16/9" href="/x" data-testid="skeleton-anchor" />);
      const anchor = screen.getByTestId('skeleton-anchor');
      expect(anchor).toHaveAttribute('href', '/x');
      expect(anchor.tagName).toBe('A');
    });
  });
});
