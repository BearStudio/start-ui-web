import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { queryRowsSchema } from './query-rows';

const countRowSchema = z.object({
  total: z.coerce.number(),
});

describe('queryRowsSchema', () => {
  it('parses raw array results', () => {
    expect(queryRowsSchema(countRowSchema).parse([{ total: '2' }])).toEqual([
      { total: 2 },
    ]);
  });

  it('normalizes objects with rows results', () => {
    expect(
      queryRowsSchema(countRowSchema).parse({ rows: [{ total: '3' }] })
    ).toEqual([{ total: 3 }]);
  });

  it('rejects invalid row shapes', () => {
    expect(() => queryRowsSchema(countRowSchema).parse({ rows: [{}] })).toThrow(
      z.ZodError
    );
  });
});
