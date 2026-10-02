// ============================================
// StoreProvider — root RTK store (admin-panel plan WU-2)
// ============================================
//
// The provider cannot import slices itself (FSD matrix: app → shared only),
// so the reducer-map is injected from the composition root. These tests use
// a local probe slice to stay layer-clean and prove three things: injected
// reducers are readable, dispatch flows through them, and the store is NOT
// recreated on re-render (the classic prop-object footgun).

import { fireEvent, render, screen } from '@testing-library/react';
import { createSlice } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { describe, expect, it } from 'vitest';

import { StoreProvider } from './StoreProvider';

type ProbeState = { value: number };
type ProbeRootState = { probe: ProbeState };

const probe = createSlice({
  name: 'probe',
  initialState: { value: 0 },
  reducers: {
    bump(state) {
      state.value += 1;
    },
  },
});

// Module-level map: stable reference across renders (documented contract).
const PROBE_REDUCERS = { probe: probe.reducer };

const ReadValue = () => {
  const value = useSelector((state: ProbeRootState) => state.probe.value);
  return <span data-testid="value">{value}</span>;
};

const BumpButton = () => {
  const dispatch = useDispatch();
  return (
    <button type="button" onClick={() => dispatch(probe.actions.bump())}>
      bump
    </button>
  );
};

describe('StoreProvider', () => {
  it('exposes the initial state of injected reducers to the tree', () => {
    render(
      <StoreProvider reducers={PROBE_REDUCERS}>
        <ReadValue />
      </StoreProvider>
    );

    expect(screen.getByTestId('value')).toHaveTextContent('0');
  });

  it('routes dispatches through the injected reducer', () => {
    render(
      <StoreProvider reducers={PROBE_REDUCERS}>
        <ReadValue />
        <BumpButton />
      </StoreProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'bump' }));

    expect(screen.getByTestId('value')).toHaveTextContent('1');
  });

  it('keeps one store across re-renders (no prop-driven recreation)', () => {
    const seen: object[] = [];
    const GrabStore = ({ children }: { children?: ReactNode }) => {
      seen.push(useStore());
      return <>{children}</>;
    };

    const view = (children: ReactNode) => (
      <StoreProvider reducers={PROBE_REDUCERS}>
        <GrabStore>{children}</GrabStore>
      </StoreProvider>
    );

    const { rerender } = render(view(null));
    rerender(view(<ReadValue />));

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).toBe(seen[seen.length - 1]);
  });
});
