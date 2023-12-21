import { useMutation } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc/client';

export const useAvatarUpload = () => {
  const getPresignedUrl = trpc.account.uploadAvatarPresignedUrl.useMutation();
  return useMutation({
    mutationFn: async (args: {
      contentType: string;
      file: File;
      metadata?: Record<string, string>;
    }) => {
      const { signedUrl, futureFileUrl } = await getPresignedUrl.mutateAsync({
        metadata: args.metadata,
      });

      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': args.contentType },
        body: args.file,
      });

      return {
        fileUrl: futureFileUrl,
      } as const;
    },
  });
};
