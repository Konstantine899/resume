// ============================================
// Modal Close Button Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalCloseButton } from './ModalCloseButton';

describe('ModalCloseButton', () => {
  it('должен рендериться', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /закрыть/i });
    expect(button).toBeInTheDocument();
  });

  it('должен вызывать onClose при клике', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('должен иметь правильный aria-label по умолчанию', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /закрыть модальное окно/i });
    expect(button).toHaveAttribute('aria-label', 'Закрыть модальное окно');
  });

  it('должен использовать кастомный aria-label', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} ariaLabel="Custom close" />);
    const button = screen.getByRole('button', { name: /custom close/i });
    expect(button).toHaveAttribute('aria-label', 'Custom close');
  });

  it('должен рендерить иконку X', () => {
    const onClose = vi.fn();
    render(<ModalCloseButton onClose={onClose} />);
    const button = screen.getByRole('button', { name: /закрыть/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
