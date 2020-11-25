import { useCallback } from 'react';

import { useHistory } from 'react-router-dom';

import { useSearchParams } from './useSearchParams';

export const useRedirectFromUrl = (defaultTo = '/') => {
  const history = useHistory();
  const { searchParams } = useSearchParams();
  return useCallback(
    () =>
      history.replace(
        searchParams.get('redirect')
          ? decodeURIComponent(searchParams.get('redirect'))
          : defaultTo
      ),
    [history, searchParams, defaultTo]
  );
};
