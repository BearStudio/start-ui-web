import axios from 'axios';
import { useMutation, MutationConfig, useQueryCache } from 'react-query';
import { useAuthContext } from '@/app/auth/AuthContext';

export const useLogin = (config: MutationConfig<any> = {}) => {
  const { updateToken } = useAuthContext();

  const queryCache = useQueryCache();
  return useMutation(
    ({ username, password }: any) =>
      axios.post('/authenticate', { username, password }),
    {
      ...config,
      onSuccess: (data, ...rest) => {
        updateToken(data.id_token);
        queryCache.clear();
        config.onSuccess(data, ...rest);
      },
    }
  );
};
