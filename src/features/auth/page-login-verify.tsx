import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';

import { authClient } from '@/features/auth/client';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_SIGNUP_ENABLED,
} from '@/features/auth/config';
import { useMascot } from '@/features/auth/mascot';
import {
  FormFieldsLoginVerify,
  zFormFieldsLoginVerify,
} from '@/features/auth/schema';
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

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(zFormFieldsLoginVerify()),
    defaultValues: {
      otp: '',
    },
  });
  const { isValid, isSubmitted } = form.formState;
  useMascot({ isError: !isValid && isSubmitted });

  const submitHandler: SubmitHandler<FormFieldsLoginVerify> = async ({
    otp,
  }) => {
    const { error } = await authClient.signIn.emailOtp({
      email: search.email,
      otp,
    });

    if (error) {
      toast.error(
        error.code
          ? t(
              `auth:errorCode.${error.code as unknown as keyof typeof authClient.$ERROR_CODES}`
            )
          : error.message || t('auth:errorCode.UNKNOWN_ERROR')
      );
      form.setError('otp', {
        message: t('auth:common.otp.invalid'),
      });
      return;
    }

    // Refetch session to update guards and redirect
    session.refetch();
  };

  return (
    <Form
      {...form}
      onSubmit={submitHandler}
      className="flex flex-col gap-4 pb-12"
    >
      <div className="flex flex-col gap-1">
        <ButtonLink variant="link" to="/login">
          <ArrowLeftIcon />
          {t('common:actions.back')}
        </ButtonLink>
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
        <FormField>
          <FormFieldLabel>{t('auth:common.otp.label')}</FormFieldLabel>
          <FormFieldController
            type="otp"
            control={form.control}
            name="otp"
            size="lg"
            maxLength={6}
            autoSubmit
            autoFocus
          />
          <FormFieldHelper className="text-xs">
            {t(`${I18N_KEY_PAGE_PREFIX}.expireHint`, {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
          </FormFieldHelper>
        </FormField>
        <Button loading={form.formState.isSubmitting} type="submit" size="lg">
          {t(`${I18N_KEY_PAGE_PREFIX}.confirm`)}
        </Button>
        <LoginEmailOtpHint />
      </div>
    </Form>
  );
}
