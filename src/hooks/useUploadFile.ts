import { useMutation } from '@tanstack/react-query';

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
        fileUrl: `https://pub-05258b3c66f44fed943559697587557f.r2.dev/${key}`,
      } as const;
    },
  });
};
