// ============================================
// Modal Close Button Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalCloseButton } from './ModalCloseButton';

describe('ModalCloseButton', () => {
  it('should render', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /close modal/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClose on click', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct default aria-label', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /close modal/i });
    expect(button).toHaveAttribute('aria-label', 'Close modal');
  });

  it('should use custom aria-label', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} ariaLabel="Custom close" />);
    const button = screen.getByRole('button', { name: /custom close/i });
    expect(button).toHaveAttribute('aria-label', 'Custom close');
  });

  it('should render X icon', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /close modal/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // Note: keyDown tests for Enter/Space removed — native <button> handles these
});
