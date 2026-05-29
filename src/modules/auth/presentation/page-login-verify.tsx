import { useStore } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useHydrated } from '@/platform/hooks/use-hydrated';

import {
  Form,
  FormField,
  FormFieldHelper,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { Button } from '@/platform/components/ui/button';
import { ButtonLink } from '@/platform/components/ui/button-link';

import {
  clearAuthScopedQueryState,
  signInEmailOtp,
  useAuthSession,
} from '@/modules/auth/client';
import {
  AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
  AUTH_SIGNUP_ENABLED,
} from '@/modules/auth/presentation/config';
import { useMascot } from '@/modules/auth/presentation/mascot';
import { zFormFieldsLoginVerify } from '@/modules/auth/presentation/schema';
import { LoginEmailOtpHint } from '@/modules/devtools/presentation';

import { authE2eDebug } from './e2e-debug';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginVerifyWithSignUp' as const)
  : ('auth:pageLoginVerify' as const);

export default function PageLoginVerify({
  search,
}: {
  search: { redirect?: string; email: string };
}) {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const session = useAuthSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();

  const form = useAppForm({
    defaultValues: {
      otp: '',
    },
    validators: { onSubmit: zFormFieldsLoginVerify() },
    onSubmit: async ({ value: { otp }, formApi }) => {
      authE2eDebug('login.verify.submit', {
        otpLength: otp.length,
        redirect: search.redirect ?? null,
      });

      const { error } = await signInEmailOtp({
        email: search.email,
        otp,
      });

      if (error) {
        authE2eDebug('login.verify.error', {
          code: error.code ?? null,
          message: typeof error.message === 'string' ? error.message : null,
        });
        const errorKey = error.code
          ? `auth:errorCode.${error.code}`
          : undefined;
        const providerMessage =
          typeof error.message === 'string' ? error.message : undefined;
        const translatedErrorMessage =
          errorKey && i18n.exists(errorKey)
            ? i18n.t(errorKey, { defaultValue: '' })
            : undefined;
        toast.error(
          translatedErrorMessage ||
            providerMessage ||
            t('auth:errorCode.UNKNOWN_ERROR')
        );
        formApi.setFieldMeta('otp', (prev) => ({
          ...prev,
          errorMap: { onSubmit: t('auth:common.otp.invalid') },
        }));
        return;
      }

      authE2eDebug('login.verify.sign_in.success');

      // Update Better Auth's client session cache, then invalidate the router
      // session cache so /login beforeLoad re-runs and redirects to the post-
      // login destination (search.redirect, /manager, /app, or /).
      await session.refetch();
      authE2eDebug('login.verify.session.refetched');
      clearAuthScopedQueryState(queryClient);
      authE2eDebug('login.verify.query_cache.cleared');
      await router.invalidate();
      authE2eDebug('login.verify.router.invalidated');
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isInvalidAfterSubmit = useStore(
    form.store,
    (s) => s.isSubmitted && !s.isValid
  );
  useMascot({ isError: isInvalidAfterSubmit });

  return (
    <Form
      form={form}
      className="flex flex-col gap-4 pb-12"
      data-hydrated={hydrated ? 'true' : 'false'}
      data-testid="auth-login-verify-form"
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
          <form.AppField name="otp">
            {(field) => (
              <field.FieldOtp
                type="otp"
                size="lg"
                maxLength={6}
                autoSubmit
                autoFocus
              />
            )}
          </form.AppField>
          <FormFieldHelper className="text-xs">
            {t(`${I18N_KEY_PAGE_PREFIX}.expireHint`, {
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            })}
          </FormFieldHelper>
        </FormField>
        <Button loading={isSubmitting} type="submit" size="lg">
          {t(`${I18N_KEY_PAGE_PREFIX}.confirm`)}
        </Button>
        <LoginEmailOtpHint />
      </div>
    </Form>
  );
}
