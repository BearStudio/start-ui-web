import {
  createQueryKeys,
  inferQueryKeys,
} from '@lukemorales/query-key-factory';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import Axios, { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import { User, zUser } from '@/features/users/schema';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';

export const accountKeys = createQueryKeys('accountService', {
  account: null,
});
type AccountKeys = inferQueryKeys<typeof accountKeys>;

export const useAccount = (
  config: UseQueryOptions<
    User,
    AxiosError<ApiErrorResponse>,
    User,
    AccountKeys['account']['queryKey']
  > = {}
) => {
  const { i18n } = useTranslation();
  const { data, ...rest } = useQuery(
    accountKeys.account.queryKey,
    async () => {
      const response = await Axios.get('/account');
      return zUser().parse(response);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        i18n.changeLanguage(data?.langKey);
        config?.onSuccess?.(data, ...args);
      },
    }
  );
  const isAdmin = !!data?.authorities?.includes('ROLE_ADMIN');
  return { data, isAdmin, ...rest };
};

export const useCreateAccount = (
  config: UseMutationOptions<
    void,
    AxiosError<
      ApiErrorResponse & {
        errorKey: 'userexists' | 'emailexists';
      }
    >,
    Pick<User, 'login' | 'email' | 'langKey'> & { password: string }
  > = {}
) => {
  return useMutation(async (payload) => {
    await Axios.post('/register', {
      ...payload,
      langKey: payload.langKey ?? DEFAULT_LANGUAGE_KEY,
    });
  }, config);
};

export const useActivateAccount = (
  config: UseMutationOptions<
    void,
    AxiosError<ApiErrorResponse>,
    {
      key: string;
    }
  > = {}
) => {
  return useMutation(async ({ key }) => {
    await Axios.get(`/activate?key=${key}`);
  }, config);
};

export const useUpdateAccount = (
  config: UseMutationOptions<void, AxiosError<ApiErrorResponse>, User> = {}
) => {
  const { i18n } = useTranslation();
  return useMutation(
    async (account) => {
      await Axios.post('/account', account);
    },
    {
      ...config,
      onMutate: (data, ...args) => {
        i18n.changeLanguage(data?.langKey);
        config.onMutate?.(data, ...args);
      },
    }
  );
};

export const useResetPasswordInit = (
  config: UseMutationOptions<void, AxiosError<ApiErrorResponse>, string> = {}
) => {
  return useMutation(async (email) => {
    await Axios.post('/account/reset-password/init', email, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }, config);
};

export const useResetPasswordFinish = (
  config: UseMutationOptions<
    void,
    AxiosError<ApiErrorResponse>,
    {
      key: string;
      newPassword: string;
    }
  > = {}
) => {
  return useMutation(async (payload) => {
    await Axios.post('/account/reset-password/finish', payload);
  }, config);
};

export const useUpdatePassword = (
  config: UseMutationOptions<
    void,
    AxiosError<ApiErrorResponse>,
    { currentPassword: string; newPassword: string }
  > = {}
) => {
  return useMutation(async (payload) => {
    await Axios.post('/account/change-password', payload);
  }, config);
};
