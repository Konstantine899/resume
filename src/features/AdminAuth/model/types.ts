// ============================================
// AdminAuth — state types (admin-panel plan WU-2)
// ============================================
//
// The store's reducer-map is injected from the composition root
// (src/App.tsx), so AdminAuth types its own view of the root state
// instead of importing a global RootState (which cannot exist while
// slices are injected from outside).

export type AdminAuthState = {
  isAuthed: boolean;
};

/** Root-state shape as seen by AdminAuth selectors. */
export type AdminAuthRootState = {
  adminAuth: AdminAuthState;
};
