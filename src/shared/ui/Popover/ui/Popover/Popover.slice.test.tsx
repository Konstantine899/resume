import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Popover } from '../../index';

describe('Popover slice integration', () => {
  it('toggles content on trigger click', () => {
    render(
      <Popover content="Popover content">
        <button>Open</button>
      </Popover>
    );
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    expect(screen.getByText('Popover content')).toBeInTheDocument();
    fireEvent.click(trigger);
  });

  it('renders trigger without crashing', () => {
    render(
      <Popover content="x">
        <span>trigger</span>
      </Popover>
    );
    expect(screen.getByText('trigger')).toBeInTheDocument();
  });
});
