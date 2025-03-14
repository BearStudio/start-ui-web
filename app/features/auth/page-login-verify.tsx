import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';

import { Form, FormField, FormFieldController } from '@/components/form';
import { Button } from '@/components/ui/button';

import {
  FormFieldsLoginVerify,
  zFormFieldsLoginVerify,
} from '@/features/auth/schemas';
import { AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES } from '@/features/auth/utils';

export default function PageLoginVerify({
  search,
}: {
  search: { redirect?: string; email: string };
}) {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();

  const form = useForm<FormFieldsLoginVerify>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsLoginVerify()),
    defaultValues: {
      otp: '',
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl">{t('auth:validate.title')}</h1>
        <p className="text-sm">
          <Trans
            t={t}
            i18nKey="auth:validate.description"
            values={{
              email: search.email,
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            }}
            components={{
              b: <strong />,
            }}
          />
        </p>
      </div>

      <Form
        {...form}
        onSubmit={async ({ otp }) => {
          const { error } = await authClient.signIn.emailOtp({
            email: search.email,
            otp,
          });

          if (error) {
            toast.error(error.message || 'Error'); // TODO Better Errors
            return;
          }

          if (search.redirect) {
            const redirectUrl = new URL(search.redirect);
            router.navigate({
              replace: true,
              to: redirectUrl.pathname,
              search: Object.fromEntries(redirectUrl.searchParams),
            });
            return;
          }

          router.navigate({
            to: '/',
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <FormField>
            <FormFieldController
              type="otp"
              control={form.control}
              name="otp"
              size="lg"
              maxLength={6}
              autoSubmit
              autoFocus
              placeholder={t('auth:data.verificationCode.label')}
            />
          </FormField>

          <div>
            <Button
              loading={form.formState.isSubmitting}
              type="submit"
              size="lg"
              className="flex-1"
            >
              {t('auth:validate.actions.confirm')}
            </Button>
          </div>
          {/* <LoginHint /> TODO */}
        </div>
      </Form>
    </div>
  );
}
