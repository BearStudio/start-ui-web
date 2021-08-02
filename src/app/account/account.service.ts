import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query';

import { Account } from '@/app/account/account.types';
import { DEFAULT_LANGUAGE } from '@/constants/i18n';

export const useAccount = (config: UseQueryOptions<Account> = {}) => {
  const { i18n } = useTranslation();
  const { data: account, ...rest } = useQuery(
    ['account'],
    (): Promise<Account> => Axios.get('/account'),
    {
      onSuccess: (data) => {
        i18n.changeLanguage(data?.langKey);

        if (config?.onSuccess) {
          config?.onSuccess(data);
        }
      },
      ...config,
    }
  );
  const isAdmin = !!account?.authorities?.includes('ROLE_ADMIN');
  return { account, isAdmin, ...rest };
};

export const useCreateAccount = (
  config: UseMutationOptions<
    Account,
    unknown,
    Pick<Account, 'login' | 'email' | 'langKey'> & { password: string }
  > = {}
) => {
  return useMutation(
    ({
      login,
      email,
      password,
      langKey = DEFAULT_LANGUAGE,
    }): Promise<Account> =>
      Axios.post('/register', { login, email, password, langKey }),
    {
      ...config,
    }
  );
};

export const useActivateAccount = (
  config: UseMutationOptions<void, unknown, { key: string }> = {}
) => {
  return useMutation(
    ({ key }): Promise<void> => Axios.get(`/activate?key=${key}`),
    {
      ...config,
    }
  );
};

export const useUpdateAccount = (
  config: UseMutationOptions<Account, unknown, Account> = {}
) => {
  const { i18n } = useTranslation();
  return useMutation(
    (account): Promise<Account> => Axios.post('/account', account),
    {
      onMutate: (data) => {
        i18n.changeLanguage(data?.langKey);

        if (config?.onMutate) {
          config.onMutate(data);
        }
      },
      ...config,
    }
  );
};

export const useResetPasswordInit = (
  config: UseMutationOptions<void, unknown, string> = {}
) => {
  return useMutation(
    (email): Promise<void> =>
      Axios.post('/account/reset-password/init', email, {
        headers: { 'Content-Type': 'text/plain' },
      }),
    {
      ...config,
    }
  );
};

export const useResetPasswordFinish = (
  config: UseMutationOptions<
    void,
    unknown,
    { key: string; newPassword: string }
  > = {}
) => {
  return useMutation(
    (payload): Promise<void> =>
      Axios.post('/account/reset-password/finish', payload),
    {
      ...config,
    }
  );
};

export const useUpdatePassword = (
  config: UseMutationOptions<
    void,
    unknown,
    { currentPassword: string; newPassword: string }
  > = {}
) => {
  return useMutation(
    (payload): Promise<void> => Axios.post('/account/change-password', payload),
    {
      ...config,
    }
  );
};
