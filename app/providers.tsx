import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import '@/lib/dayjs/config';
import '@/lib/i18n';

import { Sonner } from '@/components/ui/sonner';

export const queryClient = new QueryClient();

export const Providers = (props: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {props.children}
        <Sonner />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
