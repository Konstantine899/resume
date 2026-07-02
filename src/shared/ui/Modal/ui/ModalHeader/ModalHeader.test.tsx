// ============================================
// Modal Header Component Tests
// ============================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalHeader } from './ModalHeader';

describe('ModalHeader', () => {
  const defaultProps = {
    onClose: vi.fn(),
    title: 'Test Title',
  };

  it('должен рендерить заголовок', () => {
    render(<ModalHeader {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('должен рендерить подзаголовок', () => {
    render(<ModalHeader {...defaultProps} subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('не должен рендерить подзаголовок без prop', () => {
    render(<ModalHeader {...defaultProps} />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('должен рендерить кнопку закрытия по умолчанию', () => {
    render(<ModalHeader {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('не должен рендерить кнопку закрытия когда showCloseButton=false', () => {
    render(<ModalHeader {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument();
  });

  it('должен вызывать onClose при клике на кнопку закрытия', () => {
    const onClose = vi.fn();
    render(<ModalHeader {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('должен использовать titleId для заголовка', () => {
    render(<ModalHeader {...defaultProps} titleId="custom-title-id" />);
    expect(screen.getByText('Test Title')).toHaveAttribute('id', 'custom-title-id');
  });

  it('должен использовать subtitleId для подзаголовка', () => {
    render(<ModalHeader {...defaultProps} subtitle="Subtitle" subtitleId="custom-subtitle-id" />);
    expect(screen.getByText('Subtitle')).toHaveAttribute('id', 'custom-subtitle-id');
  });
});
