import { UseMutateAsyncFunction, useMutation } from '@tanstack/react-query';

import { UploadSignedUrlInput } from '@/lib/s3';

export const useFileUpload = (
  getPresignedUrl: UseMutateAsyncFunction<
    { signedUrl: string; futureFileUrl: string },
    unknown,
    UploadSignedUrlInput | void
  >
) => {
  return useMutation({
    mutationFn: async (
      file?: File,
      {
        metadata,
      }: {
        metadata?: Record<string, string>;
      } = {}
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
    },
  });
};
