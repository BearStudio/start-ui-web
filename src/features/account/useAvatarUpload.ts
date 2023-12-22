import { useFileUpload } from '@/hooks/useFileUpload';
import { trpc } from '@/lib/trpc/client';

export const useAvatarUpload = () => {
  const getPresignedUrl = trpc.account.uploadAvatarPresignedUrl.useMutation();
  return useFileUpload(getPresignedUrl.mutateAsync);
};
