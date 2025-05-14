import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBlocker, useCanGoBack, useRouter } from '@tanstack/react-router';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { useAppForm } from '@/lib/form/config';
import { orpc } from '@/lib/orpc/client';
import { getUiState } from '@/lib/ui-state';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { FormUser } from '@/features/user/manager/form-user';
import { FormFieldsUser, zFormFieldsUser } from '@/features/user/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUserUpdate = (props: { params: { id: string } }) => {
  const router = useRouter();
  const session = authClient.useSession();
  const canGoBack = useCanGoBack();
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
        if (canGoBack) {
          router.history.back();
        } else {
          router.navigate({ to: '..', replace: true });
        }
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data?.target?.includes('email')
        ) {
          form.setErrorMap({
            onSubmit: { fields: { email: 'Email already used' } },
          });
          return;
        }

        toast.error('Failed to update user');
      },
    })
  );

  const form = useAppForm({
    validators: { onSubmit: zFormFieldsUser() },
    defaultValues: {
      name: userQuery.data?.name ?? '',
      email: userQuery.data?.email ?? '',
      role: userQuery.data?.role ?? 'user',
    } satisfies FormFieldsUser as FormFieldsUser, // "as" to prevent type issue with validator
    onSubmit: ({ value }) => {
      userUpdate.mutate({ id: props.params.id, ...value });
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

  const formIsDirty = form.state.isDirty;
  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty || userUpdate.isSuccess) return false;
      const shouldLeave = confirm('Are you sure you want to leave?');
      return !shouldLeave;
    },
  });

  return (
    <Form form={form}>
      <PageLayout>
        <PageLayoutTopBar
          backButton={<BackButton />}
          actions={
            <Button
              size="sm"
              type="submit"
              className="min-w-20"
              loading={userUpdate.isPending}
            >
              Save
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
  );
};
