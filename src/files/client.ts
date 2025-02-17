import { useMutation, useQuery } from '@tanstack/react-query';
import { TRPCError } from '@trpc/server';
import { stringify } from 'superjson';

import { trpc } from '@/lib/trpc/client';
import { RouterInputs } from '@/lib/trpc/types';

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
  const fileResponse = await fetch(url, {
    cache: 'no-cache',
  });

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

export const useUploadFileMutation = (params: {
  getMetadata?: (file: File) => Record<string, string>;
  type: RouterInputs['files']['uploadPresignedUrl']['type'];
}) => {
  const uploadPresignedUrl = trpc.files.uploadPresignedUrl.useMutation();
  return useMutation({
    mutationFn: async (file: File) => {
      const presignedUrlOutput = await uploadPresignedUrl.mutateAsync({
        // Metadata is a Record<string, string> but should be serialized for trpc-openapi
        metadata: stringify({
          name: file.name,
          ...params?.getMetadata?.(file),
        }),
        type: params.type,
      });

      try {
        const response = await fetch(presignedUrlOutput.signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to upload the file',
          cause: e,
        });
      }

      return presignedUrlOutput.futureFileUrl;
    },
  });
};

export const useFetchFile = (url?: string | null) => {
  return useQuery({
    queryKey: ['file', url],
    queryFn: () => (url ? fetchFile(url, ['name']) : undefined),
    enabled: !!url,
  });
};
