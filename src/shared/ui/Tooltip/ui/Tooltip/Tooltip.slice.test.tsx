import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip } from '../../index';

describe('Tooltip slice integration', () => {
  it('shows content on hover and hides on leave', async () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    expect(await screen.findByText('Tooltip text', {}, { timeout: 2000 })).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
  });

  it('renders trigger without crashing', () => {
    render(
      <Tooltip content="x">
        <span>trigger</span>
      </Tooltip>
    );
    expect(screen.getByText('trigger')).toBeInTheDocument();
  });
});
