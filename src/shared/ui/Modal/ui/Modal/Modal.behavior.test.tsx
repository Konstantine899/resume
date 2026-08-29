// ============================================
// Modal — 4R regression tests (scroll lock, a11y name, canClose, forceMount)
// ============================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Modal } from './Modal';
import { resetOpenCount } from '../ModalRoot/ModalRoot';

describe('Modal (4R fixes)', () => {
  afterEach(() => {
    cleanup();
    resetOpenCount();
    document.body.style.overflow = '';
  });

  it('locks body scroll when open and restores on unmount', () => {
    const { unmount } = render(
      <Modal isOpen onClose={() => {}} title="T">
        body
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('names the dialog via aria-labelledby linked to the visible title', () => {
    render(
      <Modal isOpen onClose={() => {}} title="My Title">
        body
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    const labelledby = dialog.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const heading = document.getElementById(labelledby as string);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('My Title');
  });

  it('falls back to aria-label when no title is rendered', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        body
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-label', 'Modal dialog');
  });

  it('X button honours canClose=false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="T" canClose={false}>
        body
      </Modal>
    );
    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('X button closes when canClose=true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="T">
        body
      </Modal>
    );
    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps body in DOM during forceMount close animation', () => {
    const { rerender } = render(
      <Modal isOpen forceMount onClose={() => {}} title="T">
        body
      </Modal>
    );
    expect(screen.getByText('body')).toBeInTheDocument();
    rerender(
      <Modal isOpen={false} forceMount onClose={() => {}} title="T">
        body
      </Modal>
    );
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
