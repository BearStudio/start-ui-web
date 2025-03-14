import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';

import { Form, FormField, FormFieldController } from '@/components/form';
import { Button } from '@/components/ui/button';

import { FormFieldsLogin, zFormFieldsLogin } from '@/features/auth/schemas';

export default function PageLogin({
  search,
}: {
  search: { redirect?: string };
}) {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();

  const form = useForm<FormFieldsLogin>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsLogin()),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl">{t('auth:login.appTitle')}</h1>
      </div>

      {/* <OAuthLoginButtonsGrid /> TODO */}
      {/* <OAuthLoginDivider /> TODO */}

      <Form
        {...form}
        onSubmit={async ({ email }) => {
          const { error } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: 'sign-in',
          });

          if (error) {
            toast.error(error.message || 'Error'); // TODO Better Errors
            return;
          }

          router.navigate({
            to: '/login/verify',
            search: {
              redirect: search.redirect,
              email,
            },
          });
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

          {/* <LoginHint /> TODO */}

          <div>
            <Button
              loading={form.formState.isSubmitting}
              type="submit"
              size="lg"
              className="flex-1"
            >
              {t('auth:login.actions.login')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
