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

  it('should render title', () => {
    render(<ModalHeader {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<ModalHeader {...defaultProps} subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle without prop', () => {
    render(<ModalHeader {...defaultProps} />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should render close button by default', () => {
    render(<ModalHeader {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should not render close button when showCloseButton=false', () => {
    render(<ModalHeader {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
  });

  it('should call onClose on close button click', () => {
    const onClose = vi.fn();
    render(<ModalHeader {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should use titleId for title', () => {
    render(<ModalHeader {...defaultProps} titleId="custom-title-id" />);
    expect(screen.getByText('Test Title')).toHaveAttribute('id', 'custom-title-id');
  });

  it('should use subtitleId for subtitle', () => {
    render(<ModalHeader {...defaultProps} subtitle="Subtitle" subtitleId="custom-subtitle-id" />);
    expect(screen.getByText('Subtitle')).toHaveAttribute('id', 'custom-subtitle-id');
  });
});
