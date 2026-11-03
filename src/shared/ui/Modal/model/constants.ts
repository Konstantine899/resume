// ============================================
// Modal Component Constants
// ============================================

export const MODAL_CONSTANTS = {
  CLOSE_ICON_SIZE: 20,
} as const;

/**
 * Exit (close) animation duration for `forceMount` modals, in milliseconds.
 * @description Must mirror the CSS token `--duration-normal`
 * (see `src/app/styles/globals/_theme.scss`), which drives the `scaleOut`
 * close animation applied by `.modal.closing` in `ModalRoot.module.scss`.
 * The `.closing` class (and its `pointer-events: none`) is kept for exactly
 * this long while the exit delay runs.
 */
export const MODAL_CLOSE_DURATION_MS = 200;

/**
 * Poll interval for `select:open` inside an open modal (#232), in milliseconds.
 * @description Chrome's base-select picker exposes NO open/close event
 * (`toggle` never fires) and light-dismisses before the overlay `pointerdown`
 * dispatch, so the only way to learn "a picker was open until this press" is
 * sampling. 120 ms is imperceptible for a human press sequence (the fastest
 * realistic open→overlay-press gap is well above it) and costs one
 * `querySelector` per tick while a modal is open.
 */
export const MODAL_SELECT_POLL_MS = 120;

/**
 * Base z-index for stacked modal layers (M7).
 * @description Layer 0 renders with the plain CSS tokens (`--z-overlay: 3000`,
 * `--z-modal: 5000`) — unchanged behavior. Each additional layer +2 shifts
 * BOTH overlay and dialog above the previous dialog, so a newer overlay never
 * sits below an older dialog. Values intentionally stay below `--z-popover`
 * (6000)/`--z-toast`/`--z-tooltip` so overlays from those components keep
 * winning when mounted.
 */
export const MODAL_Z_BASE = 5000;
