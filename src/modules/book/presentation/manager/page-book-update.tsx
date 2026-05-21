import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsUploadingFiles } from '@/components/upload/utils';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';
import { FormBook } from '@/modules/book/presentation/manager/form-book';
import { FormBookCover } from '@/modules/book/presentation/manager/form-book-cover';
import { bookQueries } from '@/modules/book/presentation/queries';
import { zFormFieldsBook } from '@/modules/book/presentation/schema';
import { isServerFnError } from '@/modules/kernel/client';

export const PageBookUpdate = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['book']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const bookQuery = useQuery(bookQueries.getById({ id: props.params.id }));
  const form = useForm({
    resolver: zodResolver(zFormFieldsBook()),
    values: {
      title: bookQuery.data?.title ?? '',
      author: bookQuery.data?.author ?? '',
      genreId: bookQuery.data?.genre?.id ?? null!,
      publisher: bookQuery.data?.publisher ?? '',
      coverId: bookQuery.data?.coverId ?? '',
    },
  });

  const isUploadingFiles = useIsUploadingFiles('bookCover');

  const bookUpdate = useMutation({
    ...bookQueries.updateById(),
    onSuccess: async () => {
      await Promise.all([
        // Invalidate book entry
        queryClient.invalidateQueries({
          queryKey: bookQueries.getById({ id: props.params.id }).queryKey,
        }),
        // Invalidate books list
        queryClient.invalidateQueries({
          queryKey: bookQueries.getAll(),
          type: 'all',
        }),
      ]);

      // Redirect
      navigateBack({ ignoreBlocker: true });
    },
    onError: (error) => {
      if (isServerFnError(error) && error.code === 'CONFLICT') {
        const target = error.data?.target;
        const isTitleConflict =
          target === 'title' ||
          (Array.isArray(target) && target.includes('title'));

        if (isTitleConflict) {
          form.setError('title', {
            message: t('book:manager.form.titleAlreadyExist'),
          });
          return;
        }
      }

      toast.error(t('book:manager.update.updateError'));
    },
  });

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          bookUpdate.mutate({ id: props.params.id, ...values });
        }}
      >
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
