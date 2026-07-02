import { ORPCError } from '@orpc/client';
import { useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Form, useForm } from '@/components/form';
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
          form.setErrorMap({
            onDynamic: {
              fields: { email: t('user:manager.form.emailAlreadyExist') },
              form: undefined,
            },
          } as ExplicitAny);
          return;
        }

        toast.error(t('user:manager.new.createError'));
      },
    })
  );

  const form = useForm({
    schema: zFormFieldsUser(),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    },
    onSubmit: async (values) => {
      userCreate.mutate(values);
    },
  });

  const isDefaultValue = useStore(form.store, (s) => s.isDefaultValue);

  return (
    <>
      <PreventNavigation shouldBlock={!isDefaultValue} />
      <Form form={form}>
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
