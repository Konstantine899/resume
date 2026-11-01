export type SectionKey = 'main' | 'descriptions' | 'technologies' | 'stats' | 'cta';

export const SECTION_KEYS: readonly SectionKey[] = [
  'main',
  'descriptions',
  'technologies',
  'stats',
  'cta',
] as const;

export const defaultCollapsedState = (): Record<SectionKey, boolean> => ({
  main: true,
  descriptions: true,
  technologies: true,
  stats: true,
  cta: true,
});

export const readCollapseState = (): Record<SectionKey, boolean> => {
  try {
    const raw = localStorage.getItem('admin-about:collapsed');
    if (!raw) return defaultCollapsedState();
    const parsed = JSON.parse(raw) as {
      version?: number;
      collapsed?: Partial<Record<SectionKey, boolean>>;
    };
    if (parsed.version !== 1) {
      try {
        localStorage.removeItem('admin-about:collapsed');
      } catch {
        /* ignore */
      }
      return defaultCollapsedState();
    }
    const merged = defaultCollapsedState();
    for (const key of SECTION_KEYS) {
      const value = parsed.collapsed?.[key];
      if (typeof value === 'boolean') merged[key] = value;
    }
    return merged;
  } catch {
    return defaultCollapsedState();
  }
};

export const writeCollapseState = (value: Record<SectionKey, boolean>): void => {
  try {
    localStorage.setItem('admin-about:collapsed', JSON.stringify({ version: 1, collapsed: value }));
  } catch {
    // private mode
  }
};
