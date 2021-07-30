import { useCallback } from 'react';

import { useSearchParams } from '@/app/router';

export const usePaginationFromUrl = () => {
  const { searchParams, setSearchParam } = useSearchParams();
  const page = +(searchParams.get('page') ?? 1);
  const setPage = useCallback(
    (p) => {
      const newPage = Math.max(1, p);
      setSearchParam('page', `${newPage}`);
    },
    [setSearchParam]
  );
  return { page, setPage };
};
