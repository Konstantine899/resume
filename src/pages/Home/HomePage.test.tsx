import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import styles from './HomePage.module.scss';

// Heavy composed features/widgets are out of scope for this integration test —
// we exercise the HomePage skip link only.
vi.mock('@/features/About', () => ({ About: () => null }));
vi.mock('@/features/Contact', () => ({ Contact: () => null }));
vi.mock('@/features/Hero', () => ({ Hero: () => null }));
vi.mock('@/features/MyWork', () => ({ MyWork: () => null }));
vi.mock('@/features/Skills', () => ({ Skills: () => null }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: () => null }));
vi.mock('@/widgets/Sidebar', () => ({ Sidebar: () => null }));

describe('HomePage: skip-link integration (R3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a skip link with href="#main-content"', () => {
    render(<HomePage />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main-content');
  });

  it('is keyboard-focusable', () => {
    render(<HomePage />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    skip.focus();
    expect(document.activeElement).toBe(skip);
  });

  it('carries the hidden-until-focus off-screen class (R3/fix 6)', () => {
    render(<HomePage />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    // jsdom does not apply the SCSS module; the class carries `left:-9999px`
    // until `:focus` — guards against the cascade being dropped on migration.
    expect(skip.className).toContain(styles.skipToMain);
  });
});
