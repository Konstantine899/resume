// src/shared/ui/PageSizeGroup/ui/PageSizeGroup/PageSizeGroup.test.tsx

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageSizeGroup } from './PageSizeGroup';

// Deterministic labels: t(key) => key — same contract as Pagination.test.tsx.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('PageSizeGroup', () => {
  it('renders a visible caption for the group (not aria-only, owner 2026-10-09)', () => {
    render(<PageSizeGroup sizes={[5, 10, 20]} value={5} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    // Sighted users must learn what the buttons do without a screen reader.
    expect(within(group).getByText('perPageLabel')).toBeInTheDocument();
  });

  it('renders one button per size in array order', () => {
    render(<PageSizeGroup sizes={[20, 5, 10]} value={5} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    const buttons = within(group).getAllByRole('button');

    expect(buttons.map((button) => button.textContent)).toEqual(['20', '5', '10']);
  });

  it('presses exactly the active size', () => {
    render(<PageSizeGroup sizes={[5, 10, 20]} value={10} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    expect(within(group).getByRole('button', { name: '10' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(group).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(within(group).getByRole('button', { name: '20' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('presses nothing when value is outside sizes', () => {
    render(<PageSizeGroup sizes={[5, 10, 20]} value={7} onChange={vi.fn()} />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    for (const button of within(group).getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('calls onChange with the clicked size', () => {
    const onChange = vi.fn();
    render(<PageSizeGroup sizes={[5, 10, 20]} value={5} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    expect(onChange).toHaveBeenCalledWith(10);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders nothing for an empty sizes list', () => {
    const { container } = render(<PageSizeGroup sizes={[]} value={5} onChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
