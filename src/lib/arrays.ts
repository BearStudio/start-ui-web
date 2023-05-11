const isNumber = (value: unknown): boolean =>
  typeof parseFloat(String(value)) === 'number' &&
  !isNaN(parseFloat(String(value))) &&
  !isNaN(Number(value));

export const sortByKey =
  (sortKey: string, sortOrder: 'asc' | 'desc' = 'asc') =>
  (a: { [key: string]: unknown }, b: { [key: string]: unknown }) => {
    if (!sortKey) return 0;
    const aValue = isNumber(a[sortKey])
      ? parseFloat(String(a[sortKey]))
      : String(a[sortKey]);
    const bValue = isNumber(b[sortKey])
      ? parseFloat(String(a[sortKey]))
      : String(a[sortKey]);
    if (aValue < bValue) return sortOrder === 'desc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'desc' ? 1 : -1;
    return 0;
  };
