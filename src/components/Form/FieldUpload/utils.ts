import { useId } from 'react';

import { useQuery } from '@tanstack/react-query';

export const useFieldUploadFileFromUrl = (url: string) => {
  const id = useId();
  return useQuery({
    queryKey: ['filesFromUrls', id],
    queryFn: () => {
      return fetch(url).then((res) => {
        return res.arrayBuffer().then((buf) => {
          const urlArray = url.split('/');
          const fileName =
            (urlArray[urlArray.length - 1] ?? '').split('?')[0] ?? '';
          return {
            file: new File([buf], fileName, {
              type: res.headers.get('Content-Type') ?? undefined,
            }),
            name: fileName,
            type: res.headers.get('Content-Type') ?? undefined,
          };
        });
      });
    },
    staleTime: Infinity,
  });
};
