import { ORPCError } from '@orpc/client';
import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Form, setFormFieldError, useForm } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsUploadingFiles } from '@/components/upload/utils';

import { FormBook } from '@/features/book/manager/form-book';
import { FormBookCover } from '@/features/book/manager/form-book-cover';
import { zFormFieldsBook } from '@/features/book/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageBookUpdate = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['book']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const bookQuery = useQuery(
    orpc.book.getById.queryOptions({ input: { id: props.params.id } })
  );

  const isUploadingFiles = useIsUploadingFiles('bookCover');

  const bookUpdate = useMutation(
    orpc.book.updateById.mutationOptions({
      onSuccess: async () => {
        // Invalidate Users list
        await queryClient.invalidateQueries({
          queryKey: orpc.book.getAll.key(),
          type: 'all',
        });

        // Redirect
        navigateBack({ ignoreBlocker: true });
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data?.target?.includes('title')
        ) {
          setFormFieldError(
            form,
            'title',
            t('book:manager.form.titleAlreadyExist')
          );
          return;
        }

        toast.error(t('book:manager.update.updateError'));
      },
    })
  );

  const form = useForm({
    schema: zFormFieldsBook(),
    defaultValues: {
      title: bookQuery.data?.title ?? '',
      author: bookQuery.data?.author ?? '',
      genreId: bookQuery.data?.genre?.id ?? null!,
      publisher: bookQuery.data?.publisher ?? '',
      coverId: bookQuery.data?.coverId ?? '',
    },
    onSubmit: async (values) => {
      bookUpdate.mutate({ id: props.params.id, ...values });
    },
  });

  const isDefaultValue = useStore(form.store, (s) => s.isDefaultValue);

  return (
    <>
      <PreventNavigation shouldBlock={!isDefaultValue} />
      <Form form={form}>
        <PageLayout>
          <PageLayoutTopBar
            startActions={<BackButton />}
            endActions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                disabled={isUploadingFiles}
                loading={bookUpdate.isPending}
              >
                {t('book:manager.update.updateButton.label')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('book:manager.update.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card>
                  <CardContent>
                    <FormBook />
                  </CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto w-full max-w-64 min-w-48 flex-1"
              >
                <FormBookCover />
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
