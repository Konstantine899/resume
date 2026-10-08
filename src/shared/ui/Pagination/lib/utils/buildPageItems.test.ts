// src/shared/ui/Pagination/lib/utils/buildPageItems.test.ts

import { describe, expect, it } from 'vitest';
import { buildPageItems } from './buildPageItems';
import type { PaginationItem } from './buildPageItems';

/** Human-readable rendering: `1 … 4 5 6 … 10`. */
const render = (items: PaginationItem[]): string =>
  items.map((item) => (item.type === 'page' ? String(item.page) : '…')).join(' ');

describe('buildPageItems', () => {
  it('page 5 of 10 with siblings=1 renders `1 … 4 5 6 … 10`', () => {
    expect(render(buildPageItems(5, 10, 1))).toBe('1 … 4 5 6 … 10');
  });

  it('page 3 of 10 with siblings=1 renders a single ellipsis `1 2 3 4 … 10`', () => {
    const items = buildPageItems(3, 10, 1);

    expect(render(items)).toBe('1 2 3 4 … 10');
    expect(items.filter((item) => item.type === 'ellipsis')).toHaveLength(1);
  });

  it('a gap of exactly one skipped number renders that number instead of an ellipsis', () => {
    // {1, 3, 4, 5, 10} — the singleton gap {2} is filled, not ellipsized.
    expect(render(buildPageItems(4, 10, 1))).toBe('1 2 3 4 5 … 10');
  });

  it('always includes the first and the last page', () => {
    for (let page = 1; page <= 10; page += 1) {
      const rendered = render(buildPageItems(page, 10, 1));

      expect(rendered.startsWith('1')).toBe(true);
      expect(rendered.endsWith('10')).toBe(true);
    }
  });

  it('never renders two consecutive ellipses for any page of a long range', () => {
    for (let page = 1; page <= 42; page += 1) {
      const items = buildPageItems(page, 42, 1);
      const types = items.map((item) => item.type);

      for (let index = 1; index < types.length; index += 1) {
        const current = types[index];
        const previous = types[index - 1];
        expect(current === 'ellipsis' && previous === 'ellipsis').toBe(false);
      }
    }
  });

  it('clamps an out-of-range current page into [1, totalPages]', () => {
    expect(render(buildPageItems(99, 10, 1))).toBe('1 … 9 10');
    expect(render(buildPageItems(0, 10, 1))).toBe('1 2 … 10');
    expect(render(buildPageItems(-5, 10, 1))).toBe('1 2 … 10');
  });

  it('widens the window for a larger siblings count', () => {
    expect(render(buildPageItems(5, 10, 2))).toBe('1 2 3 4 5 6 7 … 10');
  });

  it('renders every page without ellipsis when everything fits', () => {
    expect(render(buildPageItems(2, 5, 1))).toBe('1 2 3 4 5');
  });

  it('returns nothing for a single or empty page range', () => {
    expect(buildPageItems(1, 1, 1)).toEqual([]);
    expect(buildPageItems(1, 0, 1)).toEqual([]);
    expect(buildPageItems(1, -3, 1)).toEqual([]);
  });
});
