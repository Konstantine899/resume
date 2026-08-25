import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TooltipProvider, useTooltipContext } from './TooltipContext';

const Probe = () => {
  const ctx = useTooltipContext();
  return <span data-testid="probe">{ctx.isVisible ? 'visible' : 'hidden'}</span>;
};

describe('TooltipContext', () => {
  it('provides state when used inside TooltipProvider', () => {
    render(
      <TooltipProvider position="top">
        <Probe />
      </TooltipProvider>
    );
    expect(screen.getByTestId('probe')).toBeInTheDocument();
  });

  it('returns a noop context (no crash) when used outside a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('hidden');
  });
});
