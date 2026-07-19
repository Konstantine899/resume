// ============================================
// Modal Content Component Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalContent } from './ModalContent';

describe('ModalContent', () => {
  it('should render children', () => {
    render(<ModalContent>Test Content</ModalContent>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render complex children', () => {
    render(
      <ModalContent>
        <div>
          <h2>Header</h2>
          <p>Paragraph</p>
        </div>
      </ModalContent>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ModalContent className="custom-class">Content</ModalContent>);
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-class');
  });

  it('should have default className from styles', () => {
    render(<ModalContent>Content</ModalContent>);
    const content = screen.getByText('Content');
    expect(content.className).toContain('content');
  });
});
