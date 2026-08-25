import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PopoverProvider, usePopoverContext } from './PopoverContext';

const Probe = () => {
  const ctx = usePopoverContext();
  return <span data-testid="probe">{ctx.isVisible ? 'visible' : 'hidden'}</span>;
};

describe('PopoverContext', () => {
  it('provides state when used inside PopoverProvider', () => {
    render(
      <PopoverProvider position="bottom">
        <Probe />
      </PopoverProvider>
    );
    expect(screen.getByTestId('probe')).toBeInTheDocument();
  });

  it('returns a noop context when used outside a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('hidden');
  });
});
