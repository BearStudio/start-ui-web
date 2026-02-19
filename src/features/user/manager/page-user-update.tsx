import { getUiState } from '@bearstudio/ui-state';
import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { authClient } from '@/features/auth/client';
import { FormUser } from '@/features/user/manager/form-user';
import { zFormFieldsUser } from '@/features/user/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUserUpdate = (props: { params: { id: string } }) => {
  const { t } = useTranslation(['user']);
  const { navigateBack } = useNavigateBack();
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const userQuery = useQuery(
    orpc.user.getById.queryOptions({ input: { id: props.params.id } })
  );
  const userUpdate = useMutation(
    orpc.user.updateById.mutationOptions({
      onSuccess: async (data) => {
        // Update session if user is the connected user
        if (data.id === session.data?.user.id) {
          session.refetch();
        }

        await Promise.all([
          // Invalidate User
          queryClient.invalidateQueries({
            queryKey: orpc.user.getById.key({
              input: { id: props.params.id },
            }),
          }),
          // Invalidate Users list
          queryClient.invalidateQueries({
            queryKey: orpc.user.getAll.key(),
            type: 'all',
          }),
        ]);

        // Redirect
        navigateBack({ ignoreBlocker: true });
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data?.target?.includes('email')
        ) {
          form.setError('email', {
            message: t('user:manager.form.emailAlreadyExist'),
          });
          return;
        }

        toast.error(t('user:manager.update.updateError'));
      },
    })
  );

  const form = useForm({
    resolver: zodResolver(zFormFieldsUser()),
    values: {
      name: userQuery.data?.name ?? '',
      email: userQuery.data?.email ?? '',
      role: userQuery.data?.role ?? 'user',
    },
  });

  const ui = getUiState((set) => {
    if (userQuery.status === 'pending') return set('pending');
    if (
      userQuery.status === 'error' &&
      userQuery.error instanceof ORPCError &&
      userQuery.error.code === 'NOT_FOUND'
    )
      return set('not-found');
    if (userQuery.status === 'error') return set('error');

    return set('default', { user: userQuery.data });
  });

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={(values) => {
          userUpdate.mutate({ id: props.params.id, ...values });
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
                <FormUser userId={props.params.id} />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
