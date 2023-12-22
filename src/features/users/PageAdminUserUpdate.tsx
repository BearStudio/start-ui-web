import React from 'react';

import { Button, Flex, Heading, SkeletonText } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { UserForm, UserFormFields } from '@/features/users/UserForm';
import { UserStatus } from '@/features/users/UserStatus';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminUserUpdate() {
  const { t } = useTranslation(['common', 'users']);
  const trpcUtils = trpc.useUtils();

  const params = useParams();
  const router = useRouter();
  const user = trpc.users.getById.useQuery(
    {
      id: params?.id?.toString() ?? '',
    },
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const userUpdate = trpc.users.updateById.useMutation({
    onSuccess: async () => {
      await trpcUtils.users.invalidate();
      toastSuccess({
        title: t('users:update.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: (error) => {
      if (isErrorDatabaseConflict(error, 'email')) {
        form.setErrors({ email: t('users:data.email.alreadyUsed') });
        return;
      }
      toastError({
        title: t('users:update.feedbacks.updateError.title'),
      });
    },
  });

  const isReady = !user.isFetching;

  const form = useForm<UserFormFields>({
    ready: isReady,
    initialValues: {
      email: user.data?.email,
      name: user.data?.name ?? undefined,
      language: user.data?.language,
      authorizations: user.data?.authorizations,
    },
    onValidSubmit: (values) => {
      if (!user.data?.id) return;
      userUpdate.mutate({
        id: user.data.id,
        ...values,
      });
    },
  });

  return (
    <Formiz connect={form} autoForm>
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfrim={!form.isPristine} />}
          rightActions={
            <>
              <AdminCancelButton withConfrim={!form.isPristine} />
              <Button
                type="submit"
                variant="@primary"
                isDisabled={!form.isValid && form.isSubmitted}
                isLoading={userUpdate.isLoading || userUpdate.isSuccess}
              >
                {t('users:update.action.save')}
              </Button>
            </>
          }
        >
          {user.isLoading || user.isError ? (
            <SkeletonText maxW="6rem" noOfLines={2} />
          ) : (
            <Flex
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'start', md: 'center' }}
              rowGap={1}
              columnGap={4}
            >
              <Heading size="sm">{user.data.name ?? user.data.email}</Heading>
              <UserStatus isActivated={user.data.accountStatus === 'ENABLED'} />
            </Flex>
          )}
        </AdminLayoutPageTopBar>
        {!isReady && <LoaderFull />}
        {isReady && user.isError && <ErrorPage />}
        {isReady && user.isSuccess && (
          <AdminLayoutPageContent>
            <UserForm />
          </AdminLayoutPageContent>
        )}
      </AdminLayoutPage>
    </Formiz>
  );
}
