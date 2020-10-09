import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useRedirectFromUrl = (defaultTo = '/') => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return useCallback(
    () =>
      navigate(
        searchParams.get('redirect')
          ? decodeURIComponent(searchParams.get('redirect'))
          : defaultTo
      ),
    [navigate, searchParams, defaultTo]
  );
};
