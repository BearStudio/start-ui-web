import Axios, { AxiosError } from 'axios';
import { UseMutationOptions, useMutation } from 'react-query';

import { useAuthContext } from '@/app/auth/AuthContext';

export const useLogin = (
  config: UseMutationOptions<
    { id_token: string },
    AxiosError,
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
