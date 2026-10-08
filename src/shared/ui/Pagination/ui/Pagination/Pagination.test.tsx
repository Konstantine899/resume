// src/shared/ui/Pagination/ui/Pagination/Pagination.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

// Deterministic labels: t(key) => key — aria-label assertions target raw
// i18n keys (same contract as SkillsEditorList.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders nothing when totalPages <= 1 (plan A3)', () => {
      const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
      const { container: emptyContainer } = render(
        <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
      );

      expect(container).toBeEmptyDOMElement();
      expect(emptyContainer).toBeEmptyDOMElement();
      expect(screen.queryByRole('navigation')).toBeNull();
    });

    it('wraps the row in a labelled navigation landmark', () => {
      render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'paginationNav');
    });

    it('renders `1 … 4 5 6 … 10` with the current page marked', () => {
      render(<Pagination page={5} totalPages={10} onPageChange={vi.fn()} />);

      const nav = screen.getByRole('navigation');
      expect(nav.textContent).toBe('1…456…10');
      expect(screen.getByText('5')).toHaveAttribute('aria-current', 'page');
    });

    it('marks no number as current when siblings widen the window', () => {
      render(<Pagination page={5} totalPages={10} siblings={2} onPageChange={vi.fn()} />);

      expect(screen.getByRole('navigation').textContent).toBe('1234567…10');
      expect(screen.getByText('5')).toHaveAttribute('aria-current', 'page');
    });

    it('exposes aria-labels for every control (plan A4)', () => {
      render(<Pagination page={2} totalPages={10} onPageChange={vi.fn()} />);

      expect(screen.getByLabelText('paginationPrevious')).toBeInTheDocument();
      expect(screen.getByLabelText('paginationNext')).toBeInTheDocument();
      expect(screen.getAllByLabelText('paginationPage').length).toBeGreaterThan(0);
    });

    it('applies a custom className to the root element', () => {
      render(
        <Pagination page={1} totalPages={3} onPageChange={vi.fn()} className="custom-class" />
      );

      expect(screen.getByRole('navigation')).toHaveClass('custom-class');
    });

    it('clamps an out-of-range page defensively at render time', () => {
      render(<Pagination page={99} totalPages={10} onPageChange={vi.fn()} />);

      expect(screen.getByRole('navigation').textContent).toBe('1…910');
      expect(screen.getByText('10')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByLabelText('paginationNext')).toBeDisabled();
    });
  });

  describe('Disabled edges (plan A3-bis)', () => {
    it('disables Prev on the first page and Next on the last', () => {
      render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByLabelText('paginationPrevious')).toBeDisabled();
      expect(screen.getByLabelText('paginationNext')).not.toBeDisabled();
    });

    it('disables Next on the last page', () => {
      render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);

      expect(screen.getByLabelText('paginationNext')).toBeDisabled();
      expect(screen.getByLabelText('paginationPrevious')).not.toBeDisabled();
    });
  });

  describe('Interaction', () => {
    it('calls onPageChange with the clicked page number', () => {
      const onPageChange = vi.fn();
      render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByText('4'));

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('moves by one page via the prev/next controls', () => {
      const onPageChange = vi.fn();
      render(<Pagination page={2} totalPages={10} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByLabelText('paginationPrevious'));
      fireEvent.click(screen.getByLabelText('paginationNext'));

      expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
      expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
    });

    it('does not fire for disabled edges', () => {
      const onPageChange = vi.fn();
      render(<Pagination page={1} totalPages={10} onPageChange={onPageChange} />);

      fireEvent.click(screen.getByLabelText('paginationPrevious'));

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });
});
