import { useCallback, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

export const useSearchParams = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(
    () => new URLSearchParams(search || ''),
    [search]
  );
  const setSearchParam = useCallback(
    (key: string, value: string | number = '', { replace = true } = {}) => {
      if (value || value === 0) {
        searchParams.set(key, `${value}`);
      } else {
        searchParams.delete(key);
      }
      navigate(`${pathname}?${searchParams.toString()}`, { replace });
    },
    [navigate, pathname, searchParams]
  );
  return { searchParams, setSearchParam };
};
