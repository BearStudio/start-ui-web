import { UseMutateAsyncFunction } from '@tanstack/react-query';

import { UploadSignedUrlInput } from './schemas';

/**
 * Fetches a file from the specified URL and returns file information.
 * Designed to be used as a `queryFn` in a `useQuery`.
 *
 * @param url The URL from which the file should be fetched.
 * @param [metadata] The metadata of the file you want to retrieve.
 * @returns A Promise that resolves to an object containing information about the file.
 *
 * @example
 * // Usage with Tanstack Query's useQuery:
 * const fileQuery = useQuery({
    queryKey: ['fileKey', url],
    queryFn: () => fetchFile(url, ['name']),
    enabled: !!url,
  });
 */
export const fetchFile = async (url: string, metadata?: string[]) => {
  const fileResponse = await fetch(url);
  if (!fileResponse.ok) {
    throw new Error('Could not fetch the file');
  }

  const lastModifiedDateHeader = fileResponse.headers.get('Last-Modified');
  const defaultFileData = {
    fileUrl: url,
    size: fileResponse.headers.get('Content-Length') ?? undefined,
    type: fileResponse.headers.get('Content-Type') ?? undefined,
    lastModifiedDate: lastModifiedDateHeader
      ? new Date(lastModifiedDateHeader)
      : new Date(),
  };

  if (!metadata) {
    return defaultFileData;
  }

  return metadata.reduce((file, metadataKey) => {
    return {
      ...file,
      [metadataKey]: fileResponse.headers.get(`x-amz-meta-${metadataKey}`),
    };
  }, defaultFileData);
};

/**
 * Asynchronously uploads a file to a server using a presigned URL.
 * Designed to be used as a `mutationFn` in a `useMutation`. 
 *
 * @param getPresignedUrl
 *    - An asyncMutation that is used to obtain the presigned URL and the future URL where the file will be accessible.
 *
 * @param file - The file object to upload.
 * @param metadata - Optional metadata for the file, which will be sent to the server when generating the presigned URL.
 *
 * @returns  A promise that resolves to an object containing the URL of the uploaded file,
 *    or undefined if no file was provided.
 *
 * @example
 * // Usage with Tanstack Query's useMutation:
 * const getPresignedUrl = trpc.routeToGetPresignedUrl.useMutation();
   const fileUpload =  useMutation({
    mutationFn: (file?: File) => uploadFile(getPresignedUrl.mutateAsync, file),
  });
 */
export const uploadFile = async (
  getPresignedUrl: UseMutateAsyncFunction<
    { signedUrl: string; futureFileUrl: string },
    unknown,
    UploadSignedUrlInput | void
  >,
  file?: File,
  metadata: Record<string, string> = {}
) => {
  if (!file) {
    return {
      fileUrl: undefined,
    };
  }

  const { signedUrl, futureFileUrl } = await getPresignedUrl({
    metadata: {
      name: file.name,
      ...metadata,
    },
  });

  await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  return {
    fileUrl: futureFileUrl,
  } as const;
};
