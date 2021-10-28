const isNumber = (value: any): boolean =>
  typeof parseFloat(value) === 'number' &&
  !isNaN(parseFloat(value)) &&
  !isNaN(value);

export const sortByKey =
  (sortKey: string, sortOrder: 'asc' | 'desc' = 'asc') =>
  (a, b) => {
    if (!sortKey) return 0;
    const aValue = isNumber(a[sortKey]) ? parseFloat(a[sortKey]) : a[sortKey];
    const bValue = isNumber(b[sortKey]) ? parseFloat(a[sortKey]) : a[sortKey];
    if (aValue < bValue) return sortOrder === 'desc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'desc' ? 1 : -1;
    return 0;
  };
