// ============================================
// useConfirmAction — shared destructive-confirm flow (issue #302)
// ============================================
//
// Every admin CRUD vitrina/form repeats the same destructive-confirm
// state machine around the kit Modal (SkillsEditorList §6 pattern):
//
//   request(item) → modal opens, focus lands on «Отмена» (cancelRef)
//   confirm()     → the action runs; a persist failure keeps the modal
//                   OPEN for a retry (gold standard), success closes it
//   cancel()      → the modal closes and the state resets
//
// The hook owns ONLY the state machine — the Modal JSX (title, subtitle,
// button labels, testids) stays in the feature because every copy string
// is feature-scoped i18n.

import { useRef, useState } from 'react';

export interface UseConfirmActionOptions<T> {
  /**
   * Runs the destructive action for the confirmed item.
   * Return `false` to keep the modal open (persist failed — the caller
   * owns the error toast); return `true` to close it.
   */
  onConfirm: (item: T) => boolean;
}

export interface UseConfirmActionReturn<T> {
  /** The item awaiting confirmation; null when the modal is closed. */
  pending: T | null;
  /** True while the confirm action runs (drives the confirm Button `loading`). */
  confirming: boolean;
  /** Focus target for the modal's «Отмена» button (Modal initialFocusRef). */
  cancelRef: React.RefObject<HTMLButtonElement | null>;
  /** Opens the confirm modal for `item`. */
  request: (item: T) => void;
  /** Closes the modal and resets the state (Cancel / ESC / overlay). */
  cancel: () => void;
  /** Runs onConfirm; closes on success, keeps the modal open on failure. */
  confirm: () => void;
}

export function useConfirmAction<T>({
  onConfirm,
}: UseConfirmActionOptions<T>): UseConfirmActionReturn<T> {
  const [pending, setPending] = useState<T | null>(null);
  const [confirming, setConfirming] = useState(false);
  // Destructive-confirm pattern (SkillsEditorList §6): focus lands on «Отмена».
  const cancelRef = useRef<HTMLButtonElement>(null);

  const request = (item: T): void => setPending(item);

  const cancel = (): void => {
    setPending(null);
    setConfirming(false);
  };

  const confirm = (): void => {
    if (pending === null) return;
    setConfirming(true);
    if (!onConfirm(pending)) {
      // Persist-fail parity: keep the modal OPEN for a retry.
      setConfirming(false);
      return;
    }
    setPending(null);
    setConfirming(false);
  };

  return { pending, confirming, cancelRef, request, cancel, confirm };
}

export default useConfirmAction;
