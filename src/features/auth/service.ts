import { UseMutationOptions } from '@ts-rest/react-query';

import { useAuthContext } from '@/features/auth/AuthContext';
import { client } from '@/lib/tsRest/client';
import { Contract } from '@/lib/tsRest/contract';

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
