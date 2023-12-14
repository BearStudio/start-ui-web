import { useMutation } from '@tanstack/react-query';

import { env } from '@/env.mjs';
import { trpc } from '@/lib/trpc/client';

export const useUploadFile = () => {
  const getPresignedUrl = trpc.files.uploadPresignedUrl.useMutation();
  return useMutation({
    mutationFn: async (args: {
      fileName: string;
      contentType: string;
      file: File;
    }) => {
      const { signedUrl, key } = await getPresignedUrl.mutateAsync({
        fileName: args.fileName,
      });

      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': args.contentType },
        body: args.file,
      });

      return {
        fileUrl: `${env.NEXT_PUBLIC_S3_BUCKET_PUBLIC_BASE_URL}/${key}`,
      } as const;
    },
  });
};
