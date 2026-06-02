import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useNavigateBack } from '@/platform/hooks/use-navigate-back';

import { BackButton } from '@/platform/components/back-button';
import { Form, useAppForm } from '@/platform/components/form';
import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';
import { PreventNavigation } from '@/platform/components/prevent-navigation';
import { Button } from '@/platform/components/ui/button';
import { Card, CardContent } from '@/platform/components/ui/card';
import { useIsUploadingFiles } from '@/platform/components/upload/utils';

import { useCurrentScopeKey } from '@/modules/auth/client';
import { isServerFnError } from '@/modules/kernel/client';
import { toBookId } from '@/modules/kernel/domain/ids';

import {
  FormBook,
  formBookDefaultValues,
  formBookValidators,
} from './form-book';
import { FormBookCover } from './form-book-cover';
import { bookQueries } from '../queries';

export const PageBookUpdate = (props: {
  onDemoUploadBlocked?: () => void;
  params: { id: string };
}) => {
  const { t } = useTranslation(['book']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const scopeKey = useCurrentScopeKey();
  const bookId = toBookId(props.params.id);
  const bookQuery = useQuery(bookQueries.getById({ id: bookId, scopeKey }));

  const isUploadingFiles = useIsUploadingFiles('bookCover');

  const bookUpdate = useMutation({
    ...bookQueries.updateById(),
    onSuccess: async () => {
      await Promise.all([
        // Invalidate book entry
        queryClient.invalidateQueries({
          queryKey: bookQueries.getById({ id: bookId, scopeKey }).queryKey,
        }),
        // Invalidate books list
        queryClient.invalidateQueries({
          queryKey: bookQueries.getAll(scopeKey),
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
          form.setFieldMeta('title', (prev) => ({
            ...prev,
            errorMap: { onSubmit: t('book:manager.form.titleAlreadyExist') },
          }));
          return;
        }
      }

      toast.error(t('book:manager.update.updateError'));
    },
  });

  const bookDefaultValues = useMemo(
    () =>
      formBookDefaultValues({
        title: bookQuery.data?.title ?? '',
        author: bookQuery.data?.author ?? '',
        genreId: bookQuery.data?.genre?.id ?? '',
        publisher: bookQuery.data?.publisher ?? '',
        coverId: bookQuery.data?.coverId ?? '',
      }),
    [
      bookQuery.data?.author,
      bookQuery.data?.coverId,
      bookQuery.data?.genre?.id,
      bookQuery.data?.publisher,
      bookQuery.data?.title,
    ]
  );

  const form = useAppForm({
    defaultValues: bookDefaultValues,
    validators: formBookValidators,
    onSubmit: async ({ value }) => {
      await bookUpdate.mutateAsync({ id: bookId, ...value });
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);
  const hasBook = bookQuery.data != null;

  useEffect(() => {
    if (!hasBook || isDirty) return;

    form.reset(bookDefaultValues);
  }, [bookDefaultValues, form, hasBook, isDirty]);

  return (
    <>
      <PreventNavigation shouldBlock={isDirty} />
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
                    <FormBook
                      form={form}
                      onDemoUploadBlocked={props.onDemoUploadBlocked}
                    />
                  </CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto w-full max-w-64 min-w-48 flex-1"
              >
                <FormBookCover form={form} />
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
