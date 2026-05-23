import { useIsMutating } from '@tanstack/react-query';

export const useIsUploadingFiles = (uploadRoute: string) =>
  useIsMutating({
    mutationKey: ['fileUpload', uploadRoute],
  }) > 0;
