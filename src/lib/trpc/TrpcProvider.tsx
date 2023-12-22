import { useState } from 'react';

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { TRPCClientError, httpBatchLink, loggerLink } from '@trpc/client';
import superjson from 'superjson';

import { env } from '@/env.mjs';
import { DemoModalInterceptor } from '@/features/demo-mode/DemoModalInterceptor';

import { trpc } from './client';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url SSR should use vercel url
  return env.NEXT_PUBLIC_BASE_URL;
};

export function TrpcProvider(props: { children: React.ReactNode }) {
  const [showDemo, setShowDemo] = useState(false);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode:
              env.NEXT_PUBLIC_NODE_ENV !== 'production' ? 'always' : undefined,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            if (
              error instanceof TRPCClientError &&
              error.message.startsWith('[DEMO]')
            ) {
              setShowDemo(true);
            }
          },
        }),
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            env.NEXT_PUBLIC_NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        {showDemo && (
          <DemoModalInterceptor onClose={() => setShowDemo(false)} />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
