import { useCallback } from 'react';

import { useSearchParams } from 'react-router-dom';

export const usePaginationFromUrl = () => {
  const [searchParams, setSearchParam] = useSearchParams();
  const page = +(searchParams.get('page') ?? 1);
  const setPage = useCallback(
    (p: number) => {
      const newPage = Math.max(1, p);
      setSearchParam({ page: newPage.toString() });
    },
    [setSearchParam]
  );
  return { page, setPage };
};
