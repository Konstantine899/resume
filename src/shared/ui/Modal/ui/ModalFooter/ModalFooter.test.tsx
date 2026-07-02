// ============================================
// Modal Footer Component Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalFooter } from './ModalFooter';

describe('ModalFooter', () => {
  it('должен рендерить children', () => {
    render(
      <ModalFooter>
        <button>Action</button>
      </ModalFooter>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('должен рендерить несколько кнопок', () => {
    render(
      <ModalFooter>
        <button>Cancel</button>
        <button>Save</button>
      </ModalFooter>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('должен применять кастомный className', () => {
    render(<ModalFooter className="custom-class">Content</ModalFooter>);
    const footer = screen.getByText('Content');
    expect(footer).toHaveClass('custom-class');
  });

  it('должен иметь default className из styles', () => {
    render(<ModalFooter>Content</ModalFooter>);
    const footer = screen.getByText('Content');
    expect(footer.tagName).toBe('FOOTER');
  });
});
