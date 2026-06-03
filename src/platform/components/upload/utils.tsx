import { useIsMutating } from '@tanstack/react-query';

const fileUploadMutationVersion = 'v1';

export const fileUploadMutationKey = (uploadRoute: string) =>
  ['fileUpload', fileUploadMutationVersion, uploadRoute] as const;

export const useIsUploadingFiles = (uploadRoute: string) =>
  useIsMutating({
    mutationKey: fileUploadMutationKey(uploadRoute),
  }) > 0;
