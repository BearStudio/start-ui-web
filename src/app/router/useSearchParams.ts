import { useCallback, useMemo } from 'react';

import { useLocation, useHistory } from 'react-router-dom';

export const useSearchParams = () => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(search || ''), [
    search,
  ]);
  const setSearchParam = useCallback(
    (key: string, value: string | number = '', { replace = true } = {}) => {
      if (value || value === 0) {
        searchParams.set(key, `${value}`);
      } else {
        searchParams.delete(key);
      }
      history[replace ? 'replace' : 'push'](
        `${pathname}?${searchParams.toString()}`
      );
    },
    [history, pathname, searchParams]
  );
  return { searchParams, setSearchParam };
};
