// src/shared/ui/Pagination/lib/utils/buildPageItems.ts

/**
 * One rendered element of the page-number row: either a page button or an
 * ellipsis separator.
 */
export type PaginationItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string };

/**
 * Builds the ordered list of page-number items for the component.
 *
 * Rules (plan WU-1):
 * - always render the first and the last page plus the current page ± `siblings`;
 * - an ellipsis goes BETWEEN two page numbers only when at least TWO numbers
 *   are skipped (`next - prev - 1 >= 2`) — never two consecutive ellipses;
 * - when exactly ONE number would be skipped, that number is rendered instead
 *   of an ellipsis;
 * - `page` is clamped into `[1, totalPages]` at render time (the authoritative
 *   clamp lives in the container — plan A2).
 */
export const buildPageItems = (
  page: number,
  totalPages: number,
  siblings: number
): PaginationItem[] => {
  if (!Number.isFinite(totalPages) || totalPages < 1) return [];

  const current = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const siblingCount = Math.max(Math.trunc(siblings) || 0, 0);

  const pages = new Set<number>([1, totalPages]);
  for (let offset = 0; offset <= siblingCount; offset += 1) {
    const before = current - offset;
    const after = current + offset;
    if (before >= 1) pages.add(before);
    if (after <= totalPages) pages.add(after);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  let previous = 0;

  for (const pageNumber of sorted) {
    if (previous !== 0) {
      const skipped = pageNumber - previous - 1;
      if (skipped >= 2) {
        items.push({ type: 'ellipsis', key: `ellipsis-after-${previous}` });
      } else if (skipped === 1) {
        items.push({ type: 'page', page: previous + 1 });
      }
    }
    items.push({ type: 'page', page: pageNumber });
    previous = pageNumber;
  }

  return items;
};
