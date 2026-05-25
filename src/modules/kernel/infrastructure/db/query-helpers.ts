import {
  and,
  type AnyColumn,
  eq,
  gt,
  ilike,
  lt,
  or,
  type SQL,
} from 'drizzle-orm';

import { escapeLikePattern } from './like';

export const escapedLikePattern = (value: string) =>
  `%${escapeLikePattern(value.trim())}%`;

export const escapedIlikeFilter = (
  columns: readonly AnyColumn[],
  searchTerm: string
): SQL | undefined => {
  const term = searchTerm.trim();
  if (!term) return undefined;

  const filters = columns.map((column) =>
    ilike(column, escapedLikePattern(term))
  );
  if (filters.length === 1) return filters[0];
  return or(...filters);
};

export const ascendingTextCursorFilter = (input: {
  sortColumn: AnyColumn;
  idColumn: AnyColumn;
  cursor?: { id: string; sortValue: string } | null;
}): SQL | undefined => {
  if (!input.cursor) return undefined;
  return or(
    gt(input.sortColumn, input.cursor.sortValue),
    and(
      eq(input.sortColumn, input.cursor.sortValue),
      gt(input.idColumn, input.cursor.id)
    )
  );
};

export const descendingDateCursorFilter = (input: {
  sortColumn: AnyColumn;
  idColumn: AnyColumn;
  cursor?: { id: string; sortValue: Date } | null;
}): SQL | undefined => {
  if (!input.cursor) return undefined;
  return or(
    and(
      eq(input.sortColumn, input.cursor.sortValue),
      gt(input.idColumn, input.cursor.id)
    ),
    lt(input.sortColumn, input.cursor.sortValue)
  );
};

export function takeCursorPage<TRow, TCursor>(
  rows: readonly TRow[],
  limit: number,
  toCursor: (row: TRow) => TCursor
) {
  const pageRows = rows.length > limit ? rows.slice(0, limit) : [...rows];
  const lastVisible = pageRows.at(-1);
  return {
    pageRows,
    nextCursor:
      rows.length > limit && lastVisible ? toCursor(lastVisible) : undefined,
  };
}
