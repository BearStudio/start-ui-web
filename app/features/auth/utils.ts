import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';

export const useSignOut = () =>
  useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
  });
