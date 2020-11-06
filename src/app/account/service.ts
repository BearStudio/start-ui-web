import axios from 'axios';
import {
  useMutation,
  MutationConfig,
  useQuery,
  QueryConfig,
} from 'react-query';

export const useAccount = (config: QueryConfig<any> = {}) => {
  return useQuery(['account'], () => axios.get('/account'), {
    ...config,
  });
};

export const useCreateAccount = (config: MutationConfig<any> = {}) => {
  return useMutation(
    ({ login, email, password, langKey = 'en' }) =>
      axios.post('/register', { login, email, password, langKey }),
    {
      ...config,
    }
  );
};

export const useActivateAccount = (config: MutationConfig<any> = {}) => {
  return useMutation(({ key }) => axios.get(`/activate?key=${key}`), {
    ...config,
  });
};
