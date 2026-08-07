import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Home } from 'lucide-react';
import { Icon } from './Icon';

/**
 * Custom component, имитирующий полиморфный потребительский компонент
 * (например, RouterLink). Принимает только собственные props — никаких
 * HTML-атрибутов вроде href.
 */
const CustomWrapper = forwardRef<HTMLDivElement, { children?: ReactNode; className?: string }>(
  (props, ref) => <div ref={ref} data-testid="custom-icon" {...props} />
);
CustomWrapper.displayName = 'CustomWrapper';

describe('Icon polymorphic', () => {
  describe('Polymorphic rendering', () => {
    it('renders as anchor with href when component="a"', () => {
      const { container } = render(<Icon component="a" href="/about" name={Home} />);
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', '/about');
    });

    it('default component remains a <span>', () => {
      const { container } = render(<Icon name={Home} />);
      expect(container.querySelector('span')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeNull();
    });

    it('forwards className and icon own props to custom component', () => {
      render(<Icon component={CustomWrapper} name={Home} className="appended-class" />);
      const customEl = screen.getByTestId('custom-icon');
      expect(customEl.className).toMatch(/appended-class/);
      expect(customEl.className).toMatch(/icon/);
    });

    it('renders as native <button> when component="button"', () => {
      const { container } = render(<Icon component="button" name={Home} />);
      expect(container.querySelector('button')).toBeInTheDocument();
    });
  });

  describe('Ref per component', () => {
    it('resolves ref to HTMLAnchorElement when component="a"', () => {
      const ref = { current: null };
      render(<Icon component="a" href="/about" name={Home} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('resolves default ref to HTMLSpanElement', () => {
      const ref = { current: null };
      render(<Icon name={Home} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe('Compile-time @ts-expect-error probes', () => {
    it('rejects href passed to a <span> component', () => {
      // @ts-expect-error — href is not a span attribute
      <Icon component="span" href="/x" name={Home} />;
    });

    it('rejects anchor-only attr on a custom component that does not accept it', () => {
      // @ts-expect-error — CustomWrapper has no href prop
      <Icon component={CustomWrapper} href="/x" name={Home} />;
    });
  });

  describe('a11y/keyboard lift-off for real elements', () => {
    it('component="button" keeps native role and no forced tabIndex', () => {
      const { container } = render(<Icon component="button" name={Home} />);
      const button = container.querySelector('button') as HTMLButtonElement;
      expect(button).not.toHaveAttribute('role', 'button');
      expect(button).not.toHaveAttribute('tabindex');
    });

    it('component="button" forwards onClick without Enter/Space re-dispatch markers', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <Icon component="button" name={Home} onClick={handleClick} ariaLabel="Press" />
      );
      const button = container.querySelector('button') as HTMLButtonElement;
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      // Вне span-path не должно быть data-testid и авто-атрибутов интерактивности
      expect(button).not.toHaveAttribute('data-testid');
    });
  });
});
