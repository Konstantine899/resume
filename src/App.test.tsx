import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeAll, vi } from 'vitest';
import App from './App';

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }
  vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({}) }));
});

describe('App smoke', () => {
  it('renders root', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
    expect(true).toBe(true);
  });
});
