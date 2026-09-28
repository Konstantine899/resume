// ============================================
// Modal compound context (M1 + M2)
// ============================================
//
// Bridges ModalRoot (owner of titleId/subtitleId via useId and the canClose
// gate via requestClose) to the compound members rendered inside the portal:
// ModalHeader falls back to the context ids so `aria-labelledby` on the dialog
// actually resolves, and dismissal controls (close button, alert/form actions)
// route through `requestClose` so every close path respects `canClose`.
//
// Consumers that may be used OUTSIDE a modal (ModalHeader, ModalCloseButton,
// presets) read `ModalContext` directly with `useContext` and treat null as
// "no modal above me" — they fall back to their own props instead of throwing.

import { createContext, useContext } from 'react';

export interface ModalContextValue {
  titleId: string;
  subtitleId: string;
  /** Close with the canClose gate applied. */
  requestClose: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Throwing accessor for compound members that MUST be rendered inside
 * `<Modal.Root>`. Prefer direct `useContext(ModalContext)` with a null check
 * in components that also support standalone usage.
 */
export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (ctx === null) {
    throw new Error('Modal compound members must be rendered inside <Modal.Root>.');
  }
  return ctx;
}
