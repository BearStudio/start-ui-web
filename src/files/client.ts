import { useMutation } from '@tanstack/react-query';
import { TRPCError } from '@trpc/server';
import { stringify } from 'superjson';

import { env } from '@/env.mjs';
import { trpc } from '@/lib/trpc/client';
import { RouterInputs } from '@/lib/trpc/types';

export const useUploadFileMutation = (
  collection: RouterInputs['files']['uploadPresignedUrl']['collection'],
  params: {
    getMetadata?: (file: File) => Record<string, string>;
  } = {}
) => {
  const uploadPresignedUrl = trpc.files.uploadPresignedUrl.useMutation();
  return useMutation({
    mutationFn: async (file: File) => {
      const presignedUrlOutput = await uploadPresignedUrl.mutateAsync({
        // Metadata is a Record<string, string> but should be serialized for trpc-openapi
        metadata: stringify({
          ...params.getMetadata?.(file),
        }),
        collection,
        fileType: file.type,
        size: file.size,
        name: file.name,
      });

      try {
        await fetch(presignedUrlOutput.signedUrl, {
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

      return presignedUrlOutput.key;
    },
  });
};

export const getFilePublicUrl = (key: string | null | undefined) => {
  if (!key) {
    return undefined;
  }
  return `${env.NEXT_PUBLIC_S3_BUCKET_PUBLIC_URL}/${key}`;
};
