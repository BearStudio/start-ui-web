import { getUiState } from '@bearstudio/ui-state';
import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useNavigateBack } from '@/platform/hooks/use-navigate-back';

import { BackButton } from '@/platform/components/back-button';
import { Form, useAppForm } from '@/platform/components/form';
import { PreventNavigation } from '@/platform/components/prevent-navigation';
import { Button } from '@/platform/components/ui/button';
import { Card, CardContent } from '@/platform/components/ui/card';
import { Skeleton } from '@/platform/components/ui/skeleton';

import {
  authQueries,
  useAuthSession,
  useCurrentScopeKey,
} from '@/modules/auth/client';
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

export const PageUserUpdate = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['user']);
  const { navigateBack } = useNavigateBack();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const scopeKey = useCurrentScopeKey();
  const userQuery = useQuery(
    userQueries.getById({ id: props.params.id, scopeKey })
  );
  const userUpdate = useMutation({
    ...userQueries.updateById(),
    onSuccess: async (data) => {
      // Update session if user is the connected user
      if (data.id === session.data?.user.id) {
        await session.refetch();
        await queryClient.invalidateQueries({
          queryKey: authQueries.currentSession().queryKey,
        });
        await router.invalidate();
      }

      await Promise.all([
        // Invalidate User
        queryClient.invalidateQueries({
          queryKey: userQueries.getById({ id: props.params.id, scopeKey })
            .queryKey,
        }),
        // Invalidate Users list
        queryClient.invalidateQueries({
          queryKey: userQueries.getAll(scopeKey),
          type: 'all',
        }),
      ]);

      // Redirect
      navigateBack({ ignoreBlocker: true });
    },
    onError: (error) => {
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

      toast.error(t('user:manager.update.updateError'));
    },
  });

  const form = useAppForm({
    defaultValues: formUserDefaultValues({
      name: userQuery.data?.name ?? '',
      email: userQuery.data?.email ?? '',
      role: userQuery.data?.role ?? 'user',
    }),
    validators: formUserValidators,
    onSubmit: async ({ value }) => {
      await userUpdate.mutateAsync({ id: props.params.id, ...value });
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);

  const ui = getUiState((set) => {
    if (userQuery.status === 'pending') return set('pending');
    if (
      userQuery.status === 'error' &&
      isServerFnError(userQuery.error) &&
      userQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (userQuery.status === 'error') return set('error');

    return set('default', { user: userQuery.data });
  });

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
                loading={userUpdate.isPending}
              >
                {t('user:manager.update.updateButton.label')}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {ui
                .match('pending', () => <Skeleton className="h-4 w-48" />)
                .match(['not-found', 'error'], () => (
                  <AlertCircleIcon className="size-4 text-muted-foreground" />
                ))
                .match('default', ({ user }) => <>{user.name || user.email}</>)
                .exhaustive()}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormUser form={form} userId={props.params.id} />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
