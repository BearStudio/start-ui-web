import type { ReactNode } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import '@/lib/dayjs/config';
import '@/lib/i18n';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Sonner } from '@/components/ui/sonner';

import {
  DemoModeDrawer,
  useIsDemoModeDrawerVisible,
} from '@/features/demo-mode/demo-mode-drawer';

export const Providers = (props: { children: ReactNode }) => {
  const isDemoModeDrawerVisible = useIsDemoModeDrawerVisible();
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
    >
      <QueryClientProvider>
        {props.children}
        {!isDemoModeDrawerVisible && <Sonner />}
        <DemoModeDrawer />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
