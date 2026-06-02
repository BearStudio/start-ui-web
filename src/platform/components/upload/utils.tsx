import { useIsMutating } from '@tanstack/react-query';

export const fileUploadMutationKey = (uploadRoute: string) =>
  ['fileUpload', 'v1', uploadRoute] as const;

export const useIsUploadingFiles = (uploadRoute: string) =>
  useIsMutating({
    mutationKey: fileUploadMutationKey(uploadRoute),
  }) > 0;
