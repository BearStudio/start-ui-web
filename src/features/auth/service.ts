import { UseMutationOptions } from '@ts-rest/react-query';

import { client } from '@/api/client';
import { Contract } from '@/api/contract';
import { useAuthContext } from '@/features/auth/AuthContext';

export const useLogin = (
  config: UseMutationOptions<
    Contract['auth']['authenticate'],
    typeof client
  > = {}
) => {
  const { updateToken } = useAuthContext();
  return client.auth.authenticate.useMutation({
    ...config,
    onSuccess: (data, ...args) => {
      updateToken(data.body.id_token);
      config?.onSuccess?.(data, ...args);
    },
  });
};
