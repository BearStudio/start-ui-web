import { type UseQueryOptions, useQuery } from '@tanstack/react-query';

export const useFileFetch = (
  url: string,
  userMetadata?: string[],
  config?: UseQueryOptions
) => {
  return useQuery({
    queryKey: ['file', url],
    queryFn: () => {
      return fetch(url).then((response) => {
        const lastModifiedDateHeader = response.headers.get('Last-Modified');

        return (userMetadata || []).reduce(
          (file, currentUserMetadata) => {
            return {
              ...file,
              [currentUserMetadata]: response.headers.get(
                `x-amz-meta-${currentUserMetadata}`
              ),
            };
          },
          {
            fileUrl: url,
            size: response.headers.get('Content-Length'),
            type: response.headers.get('Content-Type'),
            lastModifiedDate: lastModifiedDateHeader
              ? new Date(lastModifiedDateHeader)
              : new Date(),
          }
        );
      });
    },
    ...config,
  });
};
