import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Slot } from './Slot';

describe('Slot', () => {
  describe('rendering', () => {
    it('должен рендерить единственного потомка', () => {
      render(
        <Slot data-testid="slot">
          <span>Child</span>
        </Slot>
      );

      expect(screen.getByTestId('slot')).toBeInTheDocument();
      expect(screen.getByTestId('slot').tagName).toBe('SPAN');
      expect(screen.getByText('Child')).toBeInTheDocument();
    });

    it('должен выбросить ошибку при null потомке (Children.only)', () => {
      expect(() => render(<Slot>{null}</Slot>)).toThrow('React.Children.only');
    });

    it('должен выбросить ошибку при строковом потомке (Children.only)', () => {
      expect(() => render(<Slot>string child</Slot>)).toThrow('React.Children.only');
    });

    it('должен выбросить ошибку при множественных потомках', () => {
      expect(() =>
        render(
          <Slot>
            <span>First</span>
            <span>Second</span>
          </Slot>
        )
      ).toThrow();
    });
  });

  describe('prop forwarding', () => {
    it('должен смержить className (parent before child)', () => {
      render(
        <Slot className="parent" data-testid="slot">
          <span className="child">Text</span>
        </Slot>
      );

      const element = screen.getByTestId('slot');
      expect(element).toHaveClass('parent');
      expect(element).toHaveClass('child');
    });

    it('должен применить className, если у потомка нет className', () => {
      render(
        <Slot className="only-parent" data-testid="slot">
          <span>Text</span>
        </Slot>
      );

      expect(screen.getByTestId('slot')).toHaveClass('only-parent');
    });

    it('должен пробросить data-testid к потомку', () => {
      render(
        <Slot data-testid="slot-test">
          <span>Child</span>
        </Slot>
      );

      expect(screen.getByTestId('slot-test')).toBeInTheDocument();
      expect(screen.getByTestId('slot-test').tagName).toBe('SPAN');
    });

    it('data-testid потомка должен быть переопределён родительским', () => {
      render(
        <Slot data-testid="parent-test">
          <span data-testid="child-test">Child</span>
        </Slot>
      );

      expect(screen.getByTestId('parent-test')).toBeInTheDocument();
      expect(screen.getByText('Child').getAttribute('data-testid')).toBe('parent-test');
      expect(screen.queryByTestId('child-test')).not.toBeInTheDocument();
    });

    it('должен пробросить id к потомку', () => {
      render(
        <Slot id="slot-id" data-testid="slot">
          <span>Child</span>
        </Slot>
      );

      expect(screen.getByTestId('slot')).toHaveAttribute('id', 'slot-id');
    });

    it('id потомка должен быть переопределён родительским', () => {
      render(
        <Slot id="parent-id" data-testid="slot">
          <span id="child-id">Child</span>
        </Slot>
      );

      expect(screen.getByTestId('slot')).toHaveAttribute('id', 'parent-id');
    });

    it('forwardRef пробрасывает ref на потомка', () => {
      const refCallback = vi.fn();

      render(
        <Slot ref={refCallback as React.Ref<HTMLElement>} data-testid="slot">
          <span>Child</span>
        </Slot>
      );

      expect(refCallback).toHaveBeenCalled();
      expect(refCallback.mock.calls[0]?.[0]).toBeInstanceOf(HTMLSpanElement);
    });
  });
});
