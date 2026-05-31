import { useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useNavigateBack } from '@/platform/hooks/use-navigate-back';

import { BackButton } from '@/platform/components/back-button';
import { Form, useAppForm } from '@/platform/components/form';
import { PreventNavigation } from '@/platform/components/prevent-navigation';
import { Button } from '@/platform/components/ui/button';
import { Card, CardContent } from '@/platform/components/ui/card';

import { useCurrentScopeKey } from '@/modules/auth/client';
import { isServerFnError } from '@/modules/kernel/client';
import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';

import {
  FormUser,
  formUserDefaultValues,
  formUserValidators,
} from './form-user';
import { userQueries } from '../queries';

export const PageUserNew = () => {
  const { t } = useTranslation(['user']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const scopeKey = useCurrentScopeKey();

  const userCreate = useMutation({
    ...userQueries.create(),
    onSuccess: async () => {
      // Invalidate Users list
      await queryClient.invalidateQueries({
        queryKey: userQueries.getAll(scopeKey),
        type: 'all',
      });

      // Redirect
      navigateBack({ ignoreBlocker: true });
    },
    onError: (error, _vars, _ctx) => {
      if (
        isServerFnError(error) &&
        error.code === 'CONFLICT' &&
        Array.isArray(error.data?.target) &&
        error.data.target.includes('email')
      ) {
        form.setFieldMeta('email', (prev) => ({
          ...prev,
          errorMap: { onSubmit: t('user:manager.form.emailAlreadyExist') },
        }));
        return;
      }

      toast.error(t('user:manager.new.createError'));
    },
  });

  const form = useAppForm({
    defaultValues: formUserDefaultValues(),
    validators: formUserValidators,
    onSubmit: async ({ value }) => {
      await userCreate.mutateAsync(value);
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);

  return (
    <>
      <PreventNavigation shouldBlock={isDirty} />
      <Form form={form} data-testid="manager-user-new-form">
        <PageLayout>
          <PageLayoutTopBar
            startActions={<BackButton />}
            endActions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={userCreate.isPending}
              >
                {t('user:manager.new.createButton.label')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {t('user:manager.new.title')}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormUser form={form} />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
