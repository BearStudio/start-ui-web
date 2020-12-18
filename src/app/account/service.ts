import Axios from 'axios';
import {
  useMutation,
  MutationOptions,
  useQuery,
  QueryOptions,
} from 'react-query';

export const useAccount = (config: QueryOptions = {}) => {
  const { data: account, ...rest } = useQuery<any>(
    ['account'],
    () => Axios.get('/account'),
    {
      ...config,
    }
  );
  const isAdmin = !!account?.authorities?.includes('ROLE_ADMIN');
  return { account, isAdmin, ...rest };
};

export const useCreateAccount = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    ({ login, email, password, langKey = 'en' }) =>
      Axios.post('/register', { login, email, password, langKey }),
    {
      ...config,
    }
  );
};

export const useActivateAccount = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    ({ key }) => Axios.get(`/activate?key=${key}`),
    {
      ...config,
    }
  );
};
