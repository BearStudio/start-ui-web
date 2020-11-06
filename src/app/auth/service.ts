import Axios from 'axios';
import { useMutation, MutationConfig } from 'react-query';
import { useAuthContext } from '@/app/auth/AuthContext';

export const useLogin = (config: MutationConfig<any> = {}) => {
  const { updateToken } = useAuthContext();
  return useMutation(
    ({ username, password }: any) =>
      Axios.post('/authenticate', { username, password }),
    {
      ...config,
      onSuccess: (data, ...rest) => {
        updateToken(data.id_token);
        config.onSuccess(data, ...rest);
      },
    }
  );
};
