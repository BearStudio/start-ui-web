import React from 'react';

import { Button, ButtonGroup, Heading } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import {
  Page,
  PageBottomBar,
  PageContent,
  PageTopBar,
} from '@/components/Page';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  RepositoryForm,
  RepositoryFormFields,
} from '@/features/repositories/RepositoryForm';
import { trpc } from '@/lib/trpc/client';

export default function PageRepositoryCreate() {
  const { t } = useTranslation(['common', 'repositories']);
  const trpcContext = trpc.useContext();
  const router = useRouter();

  const toastError = useToastError();
  const toastSuccess = useToastSuccess();

  const createRepository = trpc.repositories.create.useMutation({
    onSuccess: async () => {
      await trpcContext.repositories.getAll.invalidate();
      toastSuccess({
        title: t('repositories:create.feedbacks.updateSuccess.title'),
      });
      router.back();
    },
    onError: () => {
      toastError({
        title: 'Error', // TODO
      });
      // if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
      //   const { title, errorKey } = error.body;
      //   toastError({
      //     title: t('repositories:create.feedbacks.updateError.title'),
      //     description: title,
      //   });
      //   if (errorKey === 'name_already_used') {
      //     form.setErrors({
      //       name: t('repositories:data.name.alreadyUsed'),
      //     });
      //   }
      // }
    },
  });

  const form = useForm<RepositoryFormFields>({
    onValidSubmit: (values) => {
      createRepository.mutate(values);
    },
  });

  return (
    <Page containerSize="md" isFocusMode>
      <Formiz connect={form}>
        <form noValidate onSubmit={form.submit}>
          <PageTopBar showBack onBack={() => router.back()}>
            <Heading size="md">{t('repositories:create.title')}</Heading>
          </PageTopBar>
          <PageContent>
            <RepositoryForm />
          </PageContent>
          <PageBottomBar>
            <ButtonGroup justifyContent="space-between">
              <Button onClick={() => router.back()}>
                {t('common:actions.cancel')}
              </Button>
              <Button
                type="submit"
                variant="@primary"
                isLoading={createRepository.isLoading}
              >
                {t('repositories:create.action.save')}
              </Button>
            </ButtonGroup>
          </PageBottomBar>
        </form>
      </Formiz>
    </Page>
  );
}
