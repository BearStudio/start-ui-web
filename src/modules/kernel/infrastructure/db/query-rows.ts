import { z } from 'zod';

export function queryRowsSchema<T extends z.ZodType>(itemSchema: T) {
  return z.union([
    z.array(itemSchema),
    z.object({ rows: z.array(itemSchema) }).transform((value) => value.rows),
  ]);
}
