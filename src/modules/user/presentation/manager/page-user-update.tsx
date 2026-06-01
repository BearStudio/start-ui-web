import { getUiState } from '@bearstudio/ui-state';
import { useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { match, P } from 'ts-pattern';

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
import { toUserId } from '@/modules/kernel/domain/ids';
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

const isNotFoundError = (error: unknown) =>
  isServerFnError(error) && error.code === 'NOT_FOUND';

export const PageUserUpdate = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['user']);
  const { navigateBack } = useNavigateBack();
  const session = useAuthSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const scopeKey = useCurrentScopeKey();
  const userId = toUserId(props.params.id);
  const userQuery = useQuery(userQueries.getById({ id: userId, scopeKey }));
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
          queryKey: userQueries.getById({ id: userId, scopeKey }).queryKey,
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
      await userUpdate.mutateAsync({ id: userId, ...value });
    },
  });

  const isDirty = useStore(form.store, (s) => s.isDirty);

  const ui = getUiState((set) =>
    match(userQuery)
      .with({ status: 'pending' }, () => set('pending'))
      .with({ status: 'error', error: P.when(isNotFoundError) }, () =>
        set('not-found')
      )
      .with({ status: 'error' }, () => set('error'))
      .with({ status: 'success', data: P.select() }, (user) =>
        set('default', { user })
      )
      .exhaustive()
  );

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
                <FormUser form={form} userId={userId} />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
