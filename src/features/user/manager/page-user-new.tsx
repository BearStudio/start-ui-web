import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

import { FormUser } from '@/features/user/manager/form-user';
import { zFormFieldsUser } from '@/features/user/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageUserNew = () => {
  const { t } = useTranslation(['user']);
  const { navigateBack } = useNavigateBack();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsUser()),
    values: {
      name: '',
      email: '',
      role: 'user',
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

        toast.error(t('user:manager.new.createError'));
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          userCreate.mutate(values);
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
                <FormUser />
              </CardContent>
            </Card>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
