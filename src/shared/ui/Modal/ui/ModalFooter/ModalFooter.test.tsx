// ============================================
// Modal Footer Component Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalFooter } from './ModalFooter';

describe('ModalFooter', () => {
  it('should render children', () => {
    render(
      <ModalFooter>
        <button>Action</button>
      </ModalFooter>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should render multiple buttons', () => {
    render(
      <ModalFooter>
        <button>Cancel</button>
        <button>Save</button>
      </ModalFooter>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ModalFooter className="custom-class">Content</ModalFooter>);
    const footer = screen.getByText('Content');
    expect(footer).toHaveClass('custom-class');
  });

  it('should have default className from styles', () => {
    render(<ModalFooter>Content</ModalFooter>);
    const footer = screen.getByText('Content');
    expect(footer.tagName).toBe('FOOTER');
  });
});
