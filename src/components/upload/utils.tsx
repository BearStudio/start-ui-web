import { useIsMutating } from '@tanstack/react-query';

import { UploadRoutes } from '@/routes/api/upload';

export const useIsUploadingFiles = (uploadRoute: UploadRoutes) =>
  useIsMutating({
    mutationKey: ['fileUpload', uploadRoute],
  }) > 0;
