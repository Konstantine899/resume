// ============================================
// LiveClock — state types (generated)
// ============================================
//
// The store's reducer-map is injected from the composition root
// (src/App.tsx), so LiveClock types its own view of the root state
// instead of importing a global RootState (which cannot exist while
// slices are injected from outside).

import type { ReactNode } from 'react';

export interface LiveClockProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}
