import { useEffect } from 'react';

import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQueryClient } from '@tanstack/react-query';
import { UseMutationOptions, UseQueryOptions } from '@ts-rest/react-query';
import { useTranslation } from 'react-i18next';

import { client } from '@/api/client';
import { Contract } from '@/api/contract';

export const accountKeys = createQueryKeys('accountService', {
  account: null,
  accountForm: null,
  activate: null,
});

type UseAccountQueryOptions = UseQueryOptions<Contract['account']['get']>;
export const useAccount = (queryOptions: UseAccountQueryOptions = {}) => {
  const { i18n } = useTranslation();

  const query = client.account.get.useQuery(
    queryOptions.queryKey ?? accountKeys.account.queryKey,
    undefined,
    queryOptions
  );

  useEffect(() => {
    i18n.changeLanguage(query.data?.body.langKey);
  }, [query.data?.body.langKey, i18n]);

  return {
    isAdmin: !!query.data?.body.authorities?.includes('ROLE_ADMIN'),
    ...query,
  };
};

export const useAccountFormQuery = (
  queryOptions: UseAccountQueryOptions = {}
) =>
  useAccount({
    queryKey: accountKeys.accountForm.queryKey,
    staleTime: Infinity,
    cacheTime: 0,
    ...queryOptions,
  });

export const useCreateAccount = (
  options: UseMutationOptions<
    Contract['account']['register'],
    typeof client
  > = {}
) => {
  return client.account.register.useMutation(options);
};

export const useActivateAccount = (key: string) => {
  return client.account.activate.useQuery(
    [accountKeys.activate.queryKey, key],
    { query: { key } },
    {
      staleTime: Infinity,
      cacheTime: 0,
    }
  );
};

export const useUpdateAccount = (
  config: UseMutationOptions<Contract['account']['update'], typeof client> = {}
) => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  return client.account.update.useMutation({
    ...config,
    onMutate: async (data, ...args) => {
      await i18n.changeLanguage(data?.body?.langKey);
      await config.onMutate?.(data, ...args);
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries(accountKeys.account);
      await config.onSuccess?.(...args);
    },
  });
};

export const useResetPasswordInit = (
  config: UseMutationOptions<
    Contract['account']['resetPasswordInit'],
    typeof client
  > = {}
) => {
  return client.account.resetPasswordInit.useMutation(config);
};

export const useResetPasswordFinish = (
  config: UseMutationOptions<
    Contract['account']['resetPasswordFinish'],
    typeof client
  > = {}
) => {
  return client.account.resetPasswordFinish.useMutation(config);
};

export const useUpdatePassword = (
  config: UseMutationOptions<
    Contract['account']['updatePassword'],
    typeof client
  > = {}
) => {
  return client.account.updatePassword.useMutation(config);
};
