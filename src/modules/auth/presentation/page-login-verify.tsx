import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
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
} from '@/platform/components/form';
import { Button } from '@/platform/components/ui/button';
import { ButtonLink } from '@/platform/components/ui/button-link';

import {
  authErrorCodes,
  signInEmailOtp,
  useAuthSession,
} from '@/modules/auth/client';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_SIGNUP_ENABLED,
} from '@/modules/auth/presentation/config';
import { useMascot } from '@/modules/auth/presentation/mascot';
import {
  FormFieldsLoginVerify,
  zFormFieldsLoginVerify,
} from '@/modules/auth/presentation/schema';
import { LoginEmailOtpHint } from '@/modules/devtools/presentation';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginVerifyWithSignUp' as const)
  : ('auth:pageLoginVerify' as const);

export default function PageLoginVerify({
  search,
}: {
  search: { redirect?: string; email: string };
}) {
  const { t } = useTranslation(['auth', 'common']);
  const session = useAuthSession();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    const { error } = await signInEmailOtp({
      email: search.email,
      otp,
    });

    if (error) {
      toast.error(
        error.code
          ? t(
              `auth:errorCode.${error.code as unknown as keyof typeof authErrorCodes}`
            )
          : error.message || t('auth:errorCode.UNKNOWN_ERROR')
      );
      form.setError('otp', {
        message: t('auth:common.otp.invalid'),
      });
      return;
    }

    // Update Better Auth's client session cache, then invalidate the router
    // session cache so /login beforeLoad re-runs and redirects to the post-
    // login destination (search.redirect, /manager, /app, or /).
    await session.refetch();
    await queryClient.invalidateQueries({ queryKey: ['session'] });
    await router.invalidate();
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
        <p className="text-sm text-balance wrap-break-word text-muted-foreground">
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
