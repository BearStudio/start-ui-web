import React from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  SkeletonText,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorPage } from '@/components/ErrorPage';
import { LoaderFull } from '@/components/LoaderFull';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  AdminLayoutPage,
  AdminLayoutPageBottomBar,
  AdminLayoutPageContent,
  AdminLayoutPageTopBar,
} from '@/features/admin/AdminLayoutPage';
import { UserForm, UserFormFields } from '@/features/users/UserForm';
import { UserStatus } from '@/features/users/UserStatus';
import { trpc } from '@/lib/trpc/client';
import { isErrorDatabaseConflict } from '@/lib/trpc/errors';

export default function PageAdminUserUpdate() {
  const { t } = useTranslation(['common', 'users']);
  const trpcContext = trpc.useContext();

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
      await trpcContext.users.invalidate();
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
      role: user.data?.role,
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
    <AdminLayoutPage containerSize="md" showNavBar={false}>
      <AdminLayoutPageTopBar showBack onBack={() => router.back()}>
        <HStack spacing="4">
          <Box flex="1">
            {user.isLoading || user.isError ? (
              <SkeletonText maxW="6rem" noOfLines={2} />
            ) : (
              <Stack spacing="0">
                <Heading size="sm">{user.data.name ?? user.data.email}</Heading>
                <Text
                  fontSize="xs"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                >
                  {user.data.email}
                </Text>
              </Stack>
            )}
          </Box>
          {!!user.data && (
            <Box>
              <UserStatus isActivated={user.data.accountStatus === 'ENABLED'} />
            </Box>
          )}
        </HStack>
      </AdminLayoutPageTopBar>
      {!isReady && <LoaderFull />}
      {isReady && user.isError && <ErrorPage />}
      {isReady && user.isSuccess && (
        <Formiz connect={form}>
          <form noValidate onSubmit={form.submit}>
            <AdminLayoutPageContent>
              <UserForm />
            </AdminLayoutPageContent>
            <AdminLayoutPageBottomBar>
              <ButtonGroup justifyContent="space-between">
                <Button onClick={() => router.back()}>
                  {t('common:actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="@primary"
                  isLoading={userUpdate.isLoading}
                >
                  {t('users:update.action.save')}
                </Button>
              </ButtonGroup>
            </AdminLayoutPageBottomBar>
          </form>
        </Formiz>
      )}
    </AdminLayoutPage>
  );
}
