import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSearchParams } from './useSearchParams';

export const useRedirectFromUrl = (defaultTo = '/') => {
  const navigate = useNavigate();
  const { searchParams } = useSearchParams();
  return useCallback(
    () =>
      navigate(
        searchParams.get('redirect')
          ? decodeURIComponent(searchParams.get('redirect'))
          : defaultTo,
        { replace: true }
      ),
    [navigate, searchParams, defaultTo]
  );
};
