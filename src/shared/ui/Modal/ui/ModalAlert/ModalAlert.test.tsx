import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalAlert } from './ModalAlert';

describe('ModalAlert', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Alert Title',
    message: 'Alert message',
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render with title and message', () => {
    render(<ModalAlert {...defaultProps} />);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('should render confirm button with default label', () => {
    render(<ModalAlert {...defaultProps} />);
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  });

  it('should render custom confirm label', () => {
    render(<ModalAlert {...defaultProps} confirmLabel="Confirm" />);
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('should render cancel button when cancelLabel is provided', () => {
    render(<ModalAlert {...defaultProps} cancelLabel="Cancel" />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  });

  it('should not render cancel button without cancelLabel', () => {
    render(<ModalAlert {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ModalAlert {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Alert Title')).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<ModalAlert {...defaultProps} icon={<span data-testid="custom-icon">!</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should call onConfirm and onClose on confirm click', () => {
    const onConfirm = vi.fn();
    render(<ModalAlert {...defaultProps} onConfirm={onConfirm} />);
    screen.getByRole('button', { name: /ok/i }).click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel on cancel click', () => {
    const onCancel = vi.fn();
    render(<ModalAlert {...defaultProps} cancelLabel="Cancel" onCancel={onCancel} />);
    screen.getByRole('button', { name: /cancel/i }).click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should render destructive variant with danger button', () => {
    render(<ModalAlert {...defaultProps} variant="destructive" confirmLabel="Delete" />);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });
});
