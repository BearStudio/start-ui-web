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

export const useUpdateAccount = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    (account) => Axios.post('/account', account),
    {
      ...config,
    }
  );
};

export const useResetPasswordInit = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    (email) =>
      Axios.post('/account/reset-password/init', email, {
        headers: { 'Content-Type': 'text/plain' },
      }),
    {
      ...config,
    }
  );
};

export const useResetPasswordFinish = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    ({ key, newPassword }) =>
      Axios.post('/account/reset-password/finish', { key, newPassword }),
    {
      ...config,
    }
  );
};

export const useChangePassword = (config: MutationOptions = {}) => {
  return useMutation<any, any, any>(
    ({ currentPassword, newPassword }) =>
      Axios.post('/account/change-password', { currentPassword, newPassword }),    {
      ...config,
    }
  );
};

