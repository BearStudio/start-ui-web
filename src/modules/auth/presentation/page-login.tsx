import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useHydrated } from '@/platform/hooks/use-hydrated';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { Button } from '@/platform/components/ui/button';

import { sendEmailOtp, signInSocial } from '@/modules/auth/client';
import { AUTH_SIGNUP_ENABLED } from '@/modules/auth/presentation/config';
import { useMascot } from '@/modules/auth/presentation/mascot';
import { zFormFieldsLogin } from '@/modules/auth/presentation/schema';
import { envClient } from '@/platform/env/client';

import { authE2eDebug } from './e2e-debug';
import { normalizeInternalRedirect } from './redirects';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginWithSignUp' as const)
  : ('auth:pageLogin' as const);

export default function PageLogin({
  emailHint,
  search,
}: {
  emailHint?: ReactNode;
  search: { redirect?: string };
}) {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const hydrated = useHydrated();
  const safeRedirect = normalizeInternalRedirect(search.redirect);
  const social = useMutation({
    mutationFn: async (
      provider: Parameters<typeof signInSocial>[0]['provider']
    ) => {
      const callbackURL = safeRedirect ?? '/';
      let response;
      try {
        response = await signInSocial({
          provider,
          callbackURL,
          errorCallbackURL: '/login/error',
        });
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error(t('auth:errorCode.UNKNOWN_ERROR'));
      }
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onError: (error) => {
      const message = error.message || t('auth:errorCode.UNKNOWN_ERROR');
      toast.error(message);
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: { onSubmit: zFormFieldsLogin() },
    onSubmit: async ({ value: { email } }) => {
      authE2eDebug('login.email_otp.submit', {
        redirect: safeRedirect ?? null,
      });

      let result;
      try {
        result = await sendEmailOtp({
          email,
          type: 'sign-in',
        });
      } catch (error) {
        authE2eDebug('login.email_otp.exception', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        toast.error(t('auth:errorCode.UNKNOWN_ERROR'));
        return;
      }

      if (result.error) {
        authE2eDebug('login.email_otp.error', {
          code: result.error.code ?? null,
          message:
            typeof result.error.message === 'string'
              ? result.error.message
              : null,
        });
        const errorKey = result.error.code
          ? `auth:errorCode.${result.error.code}`
          : undefined;
        const providerMessage =
          typeof result.error.message === 'string'
            ? result.error.message
            : undefined;
        const translatedErrorMessage =
          errorKey && i18n.exists(errorKey)
            ? i18n.t(errorKey, { defaultValue: '' })
            : undefined;
        const errorMessage =
          translatedErrorMessage ||
          providerMessage ||
          t('auth:errorCode.UNKNOWN_ERROR');
        toast.error(errorMessage);
        return;
      }

      authE2eDebug('login.email_otp.navigate_verify', {
        redirect: safeRedirect ?? null,
      });

      router.navigate({
        replace: true,
        to: '/login/verify',
        search: {
          redirect: safeRedirect,
          email,
        },
      });
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
      className="flex flex-col gap-6"
      data-hydrated={hydrated ? 'true' : 'false'}
      data-testid="auth-login-form"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {t(`${I18N_KEY_PAGE_PREFIX}.title`)}
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          {t(`${I18N_KEY_PAGE_PREFIX}.description`)}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-4">
          <FormField>
            <FormFieldLabel className="sr-only">
              {t('auth:common.email.label')}
            </FormFieldLabel>
            <form.AppField name="email">
              {(field) => (
                <field.FieldText
                  type="email"
                  size="lg"
                  placeholder={t('auth:common.email.label')}
                />
              )}
            </form.AppField>
          </FormField>
          <Button
            loading={isSubmitting}
            type="submit"
            size="lg"
            className="w-full"
          >
            {t(`${I18N_KEY_PAGE_PREFIX}.loginWithEmail`)}
          </Button>
          {emailHint}
        </div>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            {t(`${I18N_KEY_PAGE_PREFIX}.spacer`)}
          </span>
        </div>
        <Button
          className="w-full"
          variant="secondary"
          disabled={envClient.VITE_IS_DEMO}
          loading={
            social.variables === 'github' &&
            (social.isPending || social.isSuccess)
          }
          size="lg"
          onClick={() => social.mutate('github')}
        >
          {t(`${I18N_KEY_PAGE_PREFIX}.loginWithSocial`, { provider: 'GitHub' })}
        </Button>
      </div>
    </Form>
  );
}
