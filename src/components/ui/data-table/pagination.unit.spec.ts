import { describe, expect, it } from 'vitest';

import { pageCount, pagesAround } from '@/components/ui/data-table/pagination';

describe('pagesAround', () => {
  it('shows every page when there are few', () => {
    expect(pagesAround(1, 1)).toEqual([1]);
    expect(pagesAround(2, 3)).toEqual([1, 2, 3]);
  });

  it('shows the first, the last, and the neighbours of the current page, with a gap between', () => {
    expect(pagesAround(1, 6)).toEqual([1, 2, 'gap-after', 6]);
    expect(pagesAround(5, 10)).toEqual([
      1,
      'gap-before',
      4,
      5,
      6,
      'gap-after',
      10,
    ]);
    expect(pagesAround(6, 6)).toEqual([1, 'gap-before', 5, 6]);
  });

  it('shows a single hidden page rather than an ellipsis in its place', () => {
    expect(pagesAround(4, 8)).toEqual([1, 2, 3, 4, 5, 'gap-after', 8]);
    expect(pagesAround(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('pageCount', () => {
  it('counts a last page that is not full, and one page when there is nothing', () => {
    expect(pageCount(41, 20)).toBe(3);
    expect(pageCount(40, 20)).toBe(2);
    expect(pageCount(0, 20)).toBe(1);
  });
});

describe('pageCount', () => {
  it('counts one page for no rows, or a total that is not a number', () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(Number.NaN, 10)).toBe(1);
    expect(pageCount(45, 10)).toBe(5);
  });
});
