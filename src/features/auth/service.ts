import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import Axios, { AxiosError } from 'axios';

import { useAuthContext } from '@/features/auth/AuthContext';

import { LoginPayload, zLoginPayload } from './schema';

export const useLogin = (
  config: UseMutationOptions<
    LoginPayload,
    AxiosError<ApiErrorResponse>,
    { username: string; password: string }
  > = {}
) => {
  const { updateToken } = useAuthContext();
  return useMutation(
    async ({ username, password }) => {
      const response = await Axios.post('/authenticate', {
        username,
        password,
      });
      return zLoginPayload().parse(response.data);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        updateToken(data.id_token);
        config?.onSuccess?.(data, ...args);
      },
    }
  );
};
