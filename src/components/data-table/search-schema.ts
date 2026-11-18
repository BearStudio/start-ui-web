import { z } from 'zod';

type OptionalFilters<Filters extends z.ZodRawShape> = {
  [Key in keyof Filters]: z.ZodCatch<z.ZodOptional<Filters[Key]>>;
};

/**
 * The state of a table in the URL, as a Zod schema for the `validateSearch` of a route: the page, the text searched,
 * the sorting among `columns`, the hidden and pinned columns, and one filter per schema of `filters`.
 *
 * A key left out stays out. A value that does not validate is replaced by `undefined`, not dropped, since the router
 * keeps the raw value of a key that validation drops: the state then takes its default, in the one form it has.
 */
// Enough rows for any page a person reads; past it, a URL renders thousands of rows at once.
const maxPageSize = 100;

export const dataTableSearchSchema = <
  const Column extends string,
  const Filters extends z.ZodRawShape = Record<never, never>,
>({
  columns,
  pageSizes,
  filters,
}: {
  columns: readonly [Column, ...ReadonlyArray<Column>];
  /**
   * The page sizes the table offers: any other size in the URL is dropped. Without them, a size up to 100. Share one
   * constant with `DataTablePagination`'s `pageSizes`, so the two do not drift apart.
   */
  pageSizes?: ReadonlyArray<number>;
  filters?: Filters;
}) =>
  z.object({
    page: z.number().int().min(1).optional().catch(undefined),
    // A size the table does not offer falls back to its default, left out.
    size: (pageSizes === undefined
      ? z.number().int().min(1).max(maxPageSize)
      : z.number().refine((size) => pageSizes.includes(size))
    )
      .optional()
      .catch(undefined),
    // The router parses `?q=42` as a number: it is the search "42".
    // A search of blanks is no search, as the toolbar sends it.
    q: z
      .union([z.string(), z.number(), z.boolean()])
      .transform((value) => {
        const text = String(value);
        return text.trim() === '' ? undefined : text;
      })
      .optional()
      .catch(undefined),
    orderBy: z.enum(columns).optional().catch(undefined),
    dir: z.enum(['asc', 'desc']).optional().catch(undefined),
    hidden: z.array(z.string()).optional().catch(undefined),
    pinned: z.array(z.string()).optional().catch(undefined),
    ...(Object.fromEntries(
      Object.entries(filters ?? {}).map(([key, schema]) => [
        key,
        (schema as z.ZodType).optional().catch(undefined),
      ])
    ) as unknown as OptionalFilters<Filters>),
  });

/** The state of a table that `dataTableSearchSchema` validates. */
export type DataTableSearch<Schema extends z.ZodType> = z.output<Schema>;
