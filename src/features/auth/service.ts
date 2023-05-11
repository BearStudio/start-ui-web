import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import Axios, { AxiosError } from 'axios';

import { useAuthContext } from '@/features/auth/AuthContext';

export const useLogin = (
  config: UseMutationOptions<
    { id_token: string },
    AxiosError<TODO>,
    { username: string; password: string }
  > = {}
) => {
  const { updateToken } = useAuthContext();
  return useMutation(
    ({ username, password }) =>
      Axios.post('/authenticate', { username, password }),
    {
      ...config,
      onSuccess: (data, ...rest) => {
        updateToken(data.id_token);
        if (config.onSuccess) {
          config.onSuccess(data, ...rest);
        }
      },
    }
  );
};
