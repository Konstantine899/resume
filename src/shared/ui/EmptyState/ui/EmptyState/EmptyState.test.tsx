// src/shared/ui/EmptyState/ui/EmptyState/EmptyState.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { resolveCssModuleKey } from '@/shared/lib/utils';
import { EmptyState } from './EmptyState';
import styles from './EmptyState.module.scss';

const cls = (key: string): string => resolveCssModuleKey(styles, key);

describe('EmptyState', () => {
  it('renders only the title when no optional slots are given', () => {
    const { container } = render(<EmptyState title="No categories yet" />);

    expect(screen.getByText('No categories yet')).toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders title + description when both are passed', () => {
    render(<EmptyState title="No jobs yet" description="Add your first position." />);

    expect(screen.getByText('No jobs yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first position.')).toBeInTheDocument();
  });

  it('forwards clicks on the action slot to the consumer handler', () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="No metrics yet"
        action={
          <button type="button" onClick={onClick}>
            Refresh
          </button>
        }
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('maps align/compact to CSS modifiers', () => {
    const { rerender, container } = render(<EmptyState title="Empty" />);
    const root = () => container.firstElementChild as HTMLElement;

    // Default: centered, comfortable padding.
    expect(root()).toHaveClass(cls('alignCenter'));
    expect(root()).not.toHaveClass(cls('alignLeft'));
    expect(root()).not.toHaveClass(cls('compact'));

    rerender(<EmptyState title="Empty" align="left" compact />);
    expect(root()).toHaveClass(cls('alignLeft'));
    expect(root()).not.toHaveClass(cls('alignCenter'));
    expect(root()).toHaveClass(cls('compact'));
  });

  it('does not create wrapper elements for unset optional slots', () => {
    const { container } = render(<EmptyState title="Just a title" description={null} />);

    // No <p>/<button> scaffolding beyond the root + title.
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders no hardcoded text of its own (plan A2: all strings come from the consumer)', () => {
    const FIXTURE = 'Маркер-без-перевода-9f3a';
    const { container } = render(
      <EmptyState
        title={`${FIXTURE}-title`}
        description={`${FIXTURE}-description`}
        action={<button type="button">{`${FIXTURE}-action`}</button>}
      />
    );

    // Exact textContent equality: every rendered character is an input
    // fixture — no kit-owned copy, no extra text nodes.
    expect(container.textContent).toBe(`${FIXTURE}-title${FIXTURE}-description${FIXTURE}-action`);
  });

  it('passes className through to the root', () => {
    const { container } = render(<EmptyState title="Empty" className="custom-class" />);

    expect(container.firstElementChild).toHaveClass('custom-class');
  });
});
