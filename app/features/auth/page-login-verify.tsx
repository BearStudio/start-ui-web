import { useStore } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_SIGNUP_ENABLED,
} from '@/lib/auth/config';
import { useAppForm } from '@/lib/form/config';

import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';

import { useMascot } from '@/features/auth/mascot';
import { zFormFieldsLoginVerify } from '@/features/auth/schema';
import { LoginEmailOtpHint } from '@/features/devtools/login-hint';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginVerifyWithSignUp' as const)
  : ('auth:pageLoginVerify' as const);

export default function PageLoginVerify({
  search,
}: {
  search: { redirect?: string; email: string };
}) {
  const { t } = useTranslation(['auth', 'common']);
  const session = authClient.useSession();

  const form = useAppForm({
    validators: { onSubmit: zFormFieldsLoginVerify() },
    defaultValues: {
      otp: '',
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.emailOtp({
        email: search.email,
        otp: value.otp,
      });

      if (error) {
        toast.error(
          error.code
            ? t(
                `auth:errorCode.${error.code as unknown as keyof typeof authClient.$ERROR_CODES}`
              )
            : error.message || t('auth:errorCode.UNKNOWN_ERROR')
        );
        form.setErrorMap({
          onSubmit: { fields: { otp: t('auth:fields.otp.invalid') } },
        });
        return;
      }

      // Refetch session to update guards and redirect
      session.refetch();
    },
  });
  const { isValid, isSubmitted } = useStore(form.store, (state) => ({
    isValid: state.isValid,
    isSubmitted: state.submissionAttempts > 0,
  }));
  useMascot({ isError: !isValid && isSubmitted });

  return (
    <Form form={form} className="flex flex-col gap-4 pb-12">
      <div className="flex flex-col gap-1">
        <Button asChild variant="link">
          <Link to="/login">
            <ArrowLeftIcon />
            {t('common:actions.back')}
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-balance">
          {t(`${I18N_KEY_PAGE_PREFIX}.title`)}
        </h1>
        <p className="text-sm text-balance break-words text-muted-foreground">
          <Trans
            t={t}
            i18nKey={`${I18N_KEY_PAGE_PREFIX}.description`}
            values={{
              email: search.email,
            }}
            components={{
              b: <strong />,
            }}
          />
        </p>
      </div>
      <div className="grid gap-4">
        <form.AppField name="otp">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>
                {t('auth:fields.otp.label')}
              </field.FormFieldLabel>
              <field.FieldOtp size="lg" maxLength={6} autoSubmit autoFocus />
              <field.FormFieldHelper className="text-xs">
                {t(`${I18N_KEY_PAGE_PREFIX}.expireHint`, {
                  expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
                })}
              </field.FormFieldHelper>
            </field.FormField>
          )}
        </form.AppField>

        <Button loading={form.state.isSubmitting} type="submit" size="lg">
          {t(`${I18N_KEY_PAGE_PREFIX}.confirm`)}
        </Button>
        <LoginEmailOtpHint />
      </div>
    </Form>
  );
}
