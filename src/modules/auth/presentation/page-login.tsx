import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
import { LoginEmailHint } from '@/modules/devtools/presentation';
import { envClient } from '@/platform/env/client';

import { normalizeInternalRedirect } from './redirects';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginWithSignUp' as const)
  : ('auth:pageLogin' as const);

export default function PageLogin({
  search,
}: {
  search: { redirect?: string };
}) {
  const { i18n, t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const social = useMutation({
    mutationFn: async (
      provider: Parameters<typeof signInSocial>[0]['provider']
    ) => {
      const callbackURL = normalizeInternalRedirect(search.redirect) ?? '/';
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
      let result;
      try {
        result = await sendEmailOtp({
          email,
          type: 'sign-in',
        });
      } catch {
        toast.error(t('auth:errorCode.UNKNOWN_ERROR'));
        return;
      }

      if (result.error) {
        const errorKey = result.error.code
          ? `auth:errorCode.${result.error.code}`
          : undefined;
        const providerMessage =
          typeof result.error.message === 'string'
            ? result.error.message
            : undefined;
        const translatedErrorMessage = result.error.code
          ? i18n.getResource(
              i18n.language,
              'auth',
              `errorCode.${result.error.code}`
            )
          : undefined;
        const errorMessage =
          errorKey && typeof translatedErrorMessage === 'string'
            ? translatedErrorMessage
            : providerMessage || t('auth:errorCode.UNKNOWN_ERROR');
        toast.error(errorMessage);
        return;
      }

      router.navigate({
        replace: true,
        to: '/login/verify',
        search: {
          redirect: search.redirect,
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
    <Form form={form} className="flex flex-col gap-6">
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
          <LoginEmailHint />
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
