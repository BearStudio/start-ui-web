import React from 'react';

import { Button, Flex, Heading, SkeletonText } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { Form } from '@/components/Form';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { AdminBackButton } from '@/features/admin/AdminBackButton';
import { AdminCancelButton } from '@/features/admin/AdminCancelButton';
import {
  AdminLayoutPage,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { UserForm } from '@/features/users/UserForm';
import { UserStatus } from '@/features/users/UserStatus';
import { FormFieldUser, zFormFieldsUser } from '@/features/users/schemas';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
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
      staleTime: Infinity,
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
        form.setError('email', { message: t('users:data.email.alreadyUsed') });
        return;
      }
      toastError({
        title: t('users:update.feedbacks.updateError.title'),
      });
    },
  });

  const isReady = !user.isFetching;

  const form = useForm<FormFieldUser>({
    resolver: zodResolver(zFormFieldsUser()),
    values: {
      email: user.data?.email ?? '',
      name: user.data?.name ?? '',
      language: user.data?.language ?? DEFAULT_LANGUAGE_KEY,
      authorizations: user.data?.authorizations ?? ['APP'],
    },
  });

  return (
    <Form
      {...form}
      onSubmit={(values) => {
        if (!user.data?.id) return;
        userUpdate.mutate({
          id: user.data.id,
          ...values,
        });
      }}
    >
      <AdminLayoutPage containerMaxWidth="container.md" showNavBar={false}>
        <AdminLayoutPageTopBar
          leftActions={<AdminBackButton withConfirm={form.formState.isDirty} />}
          rightActions={
            <>
              <AdminCancelButton withConfrim={form.formState.isDirty} />
              <Button
                type="submit"
                variant="@primary"
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
    </Form>
  );
}
