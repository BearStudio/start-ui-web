import { createAppQueryClient } from '@/platform/lib/tanstack-query/query-client';

import { openDemoModeDrawer } from '@/modules/demo/presentation';
import { DEMO_MODE_ERROR, isServerFnError } from '@/modules/kernel/client';

const handleDemoModeError = (error: unknown) => {
  if (isServerFnError(error) && error.data?.reason === DEMO_MODE_ERROR) {
    openDemoModeDrawer();
  }
};

export const createClientQueryClient = () =>
  createAppQueryClient({
    onError: handleDemoModeError,
  });
