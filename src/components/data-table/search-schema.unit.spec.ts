import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { dataTableSearchSchema } from '@/components/data-table/search-schema';

const schema = dataTableSearchSchema({
  columns: ['name', 'price'],
  filters: {
    category: z.enum(['hardware', 'software']),
    tags: z.array(z.enum(['new', 'sale'])),
  },
});

describe('dataTableSearchSchema', () => {
  it('leaves out the keys the URL leaves out, and drops keys it does not know', () => {
    expect(schema.parse({})).toEqual({});
    expect(schema.parse({ other: 'x' })).toEqual({});
  });

  it('keeps valid values', () => {
    const search = {
      page: 3,
      q: 'desk',
      orderBy: 'price',
      dir: 'desc',
      hidden: ['price'],
      category: 'software',
      tags: ['new', 'sale'],
    };
    expect(schema.parse(search)).toEqual(search);
  });

  it('drops an invalid page, sorting, or direction to its default', () => {
    expect(schema.parse({ page: 0 })).toEqual({ page: undefined });
    expect(schema.parse({ page: 1.5 })).toEqual({ page: undefined });
    expect(schema.parse({ page: 'two' })).toEqual({ page: undefined });
    expect(schema.parse({ orderBy: 'category' })).toEqual({
      orderBy: undefined,
    });
    expect(schema.parse({ dir: 'up' })).toEqual({ dir: undefined });
  });

  it('reads a search the router parsed as a number or a boolean as text', () => {
    expect(schema.parse({ q: 42 })).toEqual({ q: '42' });
    expect(schema.parse({ q: true })).toEqual({ q: 'true' });
    expect(schema.parse({ q: { nested: 1 } })).toEqual({ q: undefined });
  });

  it('clears a filter or hidden columns that do not validate', () => {
    expect(schema.parse({ category: 'food' })).toEqual({
      category: undefined,
    });
    expect(schema.parse({ tags: ['new', 'old'] })).toEqual({
      tags: undefined,
    });
    expect(schema.parse({ hidden: 'price' })).toEqual({ hidden: undefined });
  });
});

describe('dataTableSearchSchema page size', () => {
  const sized = dataTableSearchSchema({
    columns: ['name'],
    pageSizes: [10, 25, 50],
  });

  it('keeps a size the table offers, and drops any other', () => {
    expect(sized.parse({ size: 25 })).toEqual({ size: 25 });
    expect(sized.parse({ size: 33 })).toEqual({ size: undefined });
    expect(sized.parse({ size: 'many' })).toEqual({ size: undefined });
  });

  it('keeps any positive whole size when the table names none', () => {
    expect(schema.parse({ size: 33 })).toEqual({ size: 33 });
    expect(schema.parse({ size: 0 })).toEqual({ size: undefined });
    expect(schema.parse({ size: 100_000 })).toEqual({ size: undefined });
  });
});

describe('dataTableSearchSchema search', () => {
  it('reads a search of blanks as none', () => {
    expect(schema.parse({ q: '  ' })).toEqual({ q: undefined });
    expect(schema.parse({ q: '' })).toEqual({ q: undefined });
    expect(schema.parse({ q: ' ada ' })).toEqual({ q: ' ada ' });
  });
});
