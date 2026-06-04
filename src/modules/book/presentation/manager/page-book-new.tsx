import { useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { bookQueries } from '@/modules/book/client';
import { isServerFnError } from '@/modules/kernel/client';

import {
  FormBook,
  formBookDefaultValues,
  formBookValidators,
} from './form-book';
import { FormBookCover } from './form-book-cover';

export const PageBookNew = (props: { onDemoUploadBlocked?: () => void }) => {
  const { t } = useTranslation(['book']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const scopeKey = useCurrentScopeKey();

  const isUploadingFiles = useIsUploadingFiles('bookCover');

  const bookCreate = useMutation({
    ...bookQueries.create(),
    onSuccess: async () => {
      // Invalidate Users list
      await queryClient.invalidateQueries({
        queryKey: bookQueries.getAll(scopeKey),
        type: 'all',
      });

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

      toast.error(t('book:manager.new.createError'));
    },
  });

  const form = useAppForm({
    defaultValues: formBookDefaultValues(),
    validators: formBookValidators,
    onSubmit: async ({ value }) => {
      await bookCreate.mutateAsync(value);
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);

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
                loading={bookCreate.isPending}
                disabled={isUploadingFiles}
              >
                {t('book:manager.new.createButton.label')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('book:manager.new.title')}
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
