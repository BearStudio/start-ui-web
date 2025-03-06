import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from '@tanstack/react-router';
import '@/lib/dayjs/config';
import '@/lib/i18n/client';

const queryClient = new QueryClient();

export const Providers = (props: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
};
