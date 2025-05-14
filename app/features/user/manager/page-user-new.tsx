import { ORPCError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker, useCanGoBack, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useAppForm } from '@/lib/form/config';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormUser } from '@/features/user/manager/form-user';
import { FormFieldsUser, zFormFieldsUser } from '@/features/user/schema';
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
    validators: { onSubmit: zFormFieldsUser() },
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    } satisfies FormFieldsUser as FormFieldsUser, // "as" to prevent type issue with validator
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
    <Form form={form}>
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
    </Form>
  );
};
