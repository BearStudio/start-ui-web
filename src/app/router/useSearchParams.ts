import { useCallback, useMemo } from 'react';

import { useLocation, useHistory } from 'react-router-dom';

export const useSearchParams = () => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(search || ''), [
    search,
  ]);
  const setSearchParams = useCallback(
    (key: string, value: string = '', { replace = true } = {}) => {
      searchParams.set(key, value);
      history[replace ? 'replace' : 'push'](
        `${pathname}?${searchParams.toString()}`
      );
    },
    [history, pathname, searchParams]
  );
  return { searchParams, setSearchParams };
};
