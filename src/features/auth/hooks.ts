import { trpc } from '@/lib/trpc/client';

export const useCheckAuthenticated = () => {
  return trpc.auth.checkAuthenticated.useQuery(undefined, {
    staleTime: 30000,
    cacheTime: Infinity,
  });
};
