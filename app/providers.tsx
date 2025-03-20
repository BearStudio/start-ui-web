import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from '@tanstack/react-router';
import '@/lib/dayjs/config';
import '@/lib/i18n';

import { Sonner } from '@/components/ui/sonner';

export const queryClient = new QueryClient();

export const Providers = (props: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      <Sonner />
    </QueryClientProvider>
  );
};
