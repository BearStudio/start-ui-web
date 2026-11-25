import type { ReactNode } from 'react';
import '@/lib/dayjs/config';
import '@/lib/i18n';
import '@fontsource-variable/inter';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Toaster } from '@/components/ui/toast';

import { envClient } from '@/env/client';
import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/features/demo/demo-mode-drawer';

export const Providers = (props: { children: ReactNode }) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  return (
    <QueryClientProvider>
      {props.children}
      {!isDemoModeDrawerVisible && <Toaster />}
      {envClient.VITE_IS_DEMO && <DemoModeDrawer />}
    </QueryClientProvider>
  );
};
