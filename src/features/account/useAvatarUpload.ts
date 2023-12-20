import { useMutation } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc/client';

export const useAvatarUpload = () => {
  const getPresignedUrl = trpc.account.uploadAvatarPresignedUrl.useMutation();
  return useMutation({
    mutationFn: async (args: { contentType: string; file: File }) => {
      const { signedUrl, futureFileUrl } = await getPresignedUrl.mutateAsync();

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
