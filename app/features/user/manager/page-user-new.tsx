import { ORPCError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker, useCanGoBack, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useAppForm } from '@/lib/form/config';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormUser, formUserOptions } from '@/features/user/manager/form-user';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUserNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const form = useAppForm({
    ...formUserOptions,
    onSubmit: async ({ value }) => {
      userCreate.mutate(value);
    },
  });

  const userCreate = useMutation(
    orpc.user.create.mutationOptions({
      onSuccess: async () => {
        // Invalidate Users list
        await queryClient.invalidateQueries({
          queryKey: orpc.user.getAll.key(),
          type: 'all',
        });

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

  const formIsDirty = form.state.isDirty;
  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty || userCreate.isSuccess) return false;
      const shouldLeave = confirm('Are you sure you want to leave?');
      return !shouldLeave;
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <PageLayout>
          <PageLayoutTopBar
            backButton={<BackButton />}
            actions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={userCreate.isPending}
              >
                Create
              </Button>
            }
          >
            <PageLayoutTopBarTitle>New User</PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <Card>
              <CardContent>
                <FormUser form={form} />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </form.Form>
    </form.AppForm>
  );
};
