import { Button } from '@chakra-ui/react';
import { parseAsString, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { LuTrash2 } from 'react-icons/lu';

import { ConfirmModal } from '@/components/ConfirmModal';
import { useToastError } from '@/components/Toast';
import {
  AccountDeleteVerificationCodeModale,
  SEARCH_PARAM_VERIFY_EMAIL,
} from '@/features/account/AccountDeleteVerificationCodeModal';
import { trpc } from '@/lib/trpc/client';

export const AccountDeleteButton = () => {
  const { t } = useTranslation(['account']);

  const [searchParams, setSearchParams] = useQueryStates(
    {
      [SEARCH_PARAM_VERIFY_EMAIL]: parseAsString,
      token: parseAsString,
    },
    {
      history: 'replace',
    }
  );
  const account = trpc.account.get.useQuery();

  const toastError = useToastError();
  const deleteAccountValidate = searchParams[SEARCH_PARAM_VERIFY_EMAIL];

  const deleteAccount = trpc.account.deleteRequest.useMutation({
    onSuccess: async ({ token }) => {
      if (!account.data) return;
      setSearchParams({
        [SEARCH_PARAM_VERIFY_EMAIL]: account.data.email,
        token,
      });
    },
    onError: () => {
      toastError({
        title: t('account:deleteAccount.feedbacks.updateError.title'),
      });
    },
  });

  return (
    <>
      <ConfirmModal
        onConfirm={() => deleteAccount.mutate()}
        title={t('account:deleteAccount.confirm.title')}
        message={t('account:deleteAccount.confirm.message')}
        confirmText={t('account:deleteAccount.confirm.button')}
        confirmVariant="@dangerPrimary"
      >
        <Button variant="@dangerPrimary" leftIcon={<LuTrash2 />}>
          {t('account:deleteAccount.button')}
        </Button>
      </ConfirmModal>

      {!!deleteAccountValidate && <AccountDeleteVerificationCodeModale />}
    </>
  );
};
