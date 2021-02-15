import Axios from 'axios';
import { useMutation, MutationOptions } from 'react-query';

import { useAuthContext } from '@/app/auth/AuthContext';

export const useLogin = (config: MutationOptions = {}) => {
  const { updateToken } = useAuthContext();
  return useMutation<any, any, any>(
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
