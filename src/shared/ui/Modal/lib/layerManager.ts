// ============================================
// Modal layer manager (M7)
// ============================================
//
// Module-level stack of open modal layers. Only the TOPMOST layer may own
// Escape/focus containment; z-index increases per layer so a newer overlay
// never sits below an older dialog. Lower layers expose `isTop=false` so the
// consumer can mark them inert/aria-hidden.
//
// Layers are keyed by the consumer's OWN stable id (useId) — registration is
// a pure side effect on this module store, never React state, so consumers
// can read `isTopLayer`/`layerIndex` during render without refs or setState.
//
// The stack is observable via `subscribe`/`getSnapshot` for `useSyncExternalStore`
// — consumers re-render when the topmost layer changes.

export interface ModalLayer {
  id: string;
}

let version = 0;
const listeners = new Set<() => void>();
const stack: ModalLayer[] = [];

function bump(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

/** Register a layer (open). Ids are unique per consumer instance (useId). */
export function registerLayer(id: string): void {
  if (stack.some((layer) => layer.id === id)) return;
  stack.push({ id });
  bump();
}

/** Unregister a layer (close/unmount). Unknown ids are ignored. */
export function unregisterLayer(id: string): void {
  const index = stack.findIndex((layer) => layer.id === id);
  if (index === -1) return;
  stack.splice(index, 1);
  bump();
}

export function isTopLayer(id: string | null): boolean {
  if (id === null) return false;
  const top = stack[stack.length - 1];
  return top !== undefined && top.id === id;
}

/** 0-based height of the layer in the stack; -1 when not registered. */
export function layerIndex(id: string | null): number {
  if (id === null) return -1;
  return stack.findIndex((layer) => layer.id === id);
}

export function subscribeLayerManager(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLayerManagerSnapshot(): number {
  return version;
}

/** Test helper: clear the stack between tests. */
export function resetLayerManager(): void {
  stack.length = 0;
  bump();
}
