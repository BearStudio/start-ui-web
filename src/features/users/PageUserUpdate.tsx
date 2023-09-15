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
import {
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { UserForm, UserFormFields } from '@/features/users/UserForm';
import { UserStatus } from '@/features/users/UserStatus';
import { Loader } from '@/layout/Loader';
import { trpc } from '@/lib/trpc/client';

export default function PageUserUpdate() {
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
        title: 'Success', // TODO
      });
    },
    onError: () => {
      toastError({
        title: 'Error', // TODO
      });
    },
    // onError: (error) => {
    //   if (error.body) {
    //     if (error.status === 400) {
    //       const { title, errorKey } = error.body;
    //       toastError({
    //         title: t('users:update.feedbacks.updateError.title'),
    //         description: title,
    //       });
    //       switch (errorKey) {
    //         case 'userexists':
    //           form.setErrors({
    //             login: t('users:data.login.alreadyUsed'),
    //           });
    //           break;
    //         case 'emailexists':
    //           form.setErrors({
    //             email: t('users:data.email.alreadyUsed'),
    //           });
    //           break;
    //       }
    //       return;
    //     }
    //     toastError({
    //       title: t('users:update.feedbacks.updateError.title'),
    //     });
    //   }
    // },
    // onSuccess: () => {
    //   toastSuccess({
    //     title: t('users:update.feedbacks.updateSuccess.title'),
    //   });
    //   router.back();
    // },
  });

  const isReady = !user.isFetching;

  const form = useForm<UserFormFields>({
    ready: isReady,
    initialValues: user.data as TODO, // TODO
    onValidSubmit: (values) => {
      if (!user.data?.id) return;
      userUpdate.mutate({
        id: user.data.id,
        ...values,
      });
    },
  });

  return (
    <Page containerSize="md" isFocusMode>
      <PageTopBar showBack onBack={() => router.back()}>
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
              <UserStatus isActivated={user.data.activated} />
            </Box>
          )}
        </HStack>
      </PageTopBar>
      {!isReady && <Loader />}
      {isReady && user.isError && <ErrorPage />}
      {isReady && user.isSuccess && (
        <Formiz connect={form}>
          <form noValidate onSubmit={form.submit}>
            <PageContent>
              <UserForm />
            </PageContent>
            <PageBottomBar>
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
            </PageBottomBar>
          </form>
        </Formiz>
      )}
    </Page>
  );
}
