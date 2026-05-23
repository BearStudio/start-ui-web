import { createAppQueryClient } from '@/platform/lib/tanstack-query/query-client';

import { openDemoModeDrawer } from '@/modules/demo/presentation';
import { isServerFnError } from '@/modules/kernel/client';

const handleDemoModeError = (error: unknown) => {
  if (isServerFnError(error) && error.message === 'DEMO_MODE_ENABLED') {
    openDemoModeDrawer();
  }
};

export const queryClient = createAppQueryClient({
  onError: handleDemoModeError,
});
