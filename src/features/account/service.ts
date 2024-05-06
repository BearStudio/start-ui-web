import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc/client';

import { fetchFile, uploadFile } from '../../files/utils';

export const useAvatarFetch = (url: string) => {
  return useQuery({
    queryKey: ['account', url],
    queryFn: fetchFile(url, ['name']),
    enabled: !!url,
  });
};

export const useAvatarUpload = () => {
  const getPresignedUrl = trpc.account.uploadAvatarPresignedUrl.useMutation();
  return useMutation({
    mutationFn: uploadFile(getPresignedUrl.mutateAsync),
  });
};
