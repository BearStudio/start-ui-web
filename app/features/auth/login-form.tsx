import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';
import { Inputs, Outputs } from '@/lib/orpc/types';

import { Form, FormField, FormFieldController } from '@/components/form';
import { Button } from '@/components/ui/button';

import { FormFieldsLogin, zFormFieldsLogin } from '@/features/auth/schemas';

export const LoginForm = ({
  onSuccess = () => undefined,
  ...rest
}: ComponentProps<'div'> & {
  onSuccess?: (
    data: Outputs['auth']['login'],
    variables: Inputs['auth']['login']
  ) => void;
}) => {
  const { t } = useTranslation(['auth']);

  const login = useMutation(
    orpc.auth.login.mutationOptions({
      onSuccess,
      onError: () => {
        toast.error(t('auth:login.feedbacks.loginError.title'));
      },
    })
  );

  const form = useForm<FormFieldsLogin>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsLogin()),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div {...rest}>
      <Form
        {...form}
        onSubmit={(values) => {
          login.mutate(values);
        }}
      >
        <div className="flex flex-col gap-4">
          <FormField>
            <FormFieldController
              type="email"
              control={form.control}
              name="email"
              size="lg"
              placeholder={t('auth:data.email.label')}
            />
          </FormField>
          <div>
            <Button
              loading={login.isPending || login.isSuccess}
              type="submit"
              size="lg"
              className="flex-1"
            >
              {t('auth:login.actions.login')}
            </Button>
          </div>

          {/* <LoginHint /> TODO */}
        </div>
      </Form>
    </div>
  );
};
