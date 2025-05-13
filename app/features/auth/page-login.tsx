import { useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth/client';
import { AUTH_SIGNUP_ENABLED } from '@/lib/auth/config';
import { useAppForm } from '@/lib/form/config';

import { Button } from '@/components/ui/button';

import { useMascot } from '@/features/auth/mascot';
import { zFormFieldsLogin } from '@/features/auth/schema';
import { LoginEmailHint } from '@/features/devtools/login-hint';

const I18N_KEY_PAGE_PREFIX = AUTH_SIGNUP_ENABLED
  ? ('auth:pageLoginWithSignUp' as const)
  : ('auth:pageLogin' as const);

export default function PageLogin({
  search,
}: {
  search: { redirect?: string };
}) {
  const { t } = useTranslation(['auth', 'common']);
  const router = useRouter();
  const social = useMutation({
    mutationFn: async (
      provider: Parameters<typeof authClient.signIn.social>[0]['provider']
    ) => {
      const response = await authClient.signIn.social({
        provider,
        callbackURL: search.redirect ?? '/',
        errorCallbackURL: '/login/error',
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onError: (error) => {
      form.setErrorMap({
        onSubmit: { fields: { email: error.message } },
      });
      toast.error(error.message);
    },
  });

  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    validators: { onSubmit: zFormFieldsLogin() },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: value.email,
        type: 'sign-in',
      });

      if (error) {
        toast.error(
          error.code
            ? t(
                `auth:errorCode.${error.code as unknown as keyof typeof authClient.$ERROR_CODES}`
              )
            : error.message || t('auth:errorCode.UNKNOWN_ERROR')
        );
        return;
      }

      router.navigate({
        replace: true,
        to: '/login/verify',
        search: {
          redirect: search.redirect,
          email: value.email,
        },
      });
    },
  });

  const { isValid, isSubmitted } = useStore(form.store, (state) => ({
    isValid: state.isValid,
    isSubmitted: state.submissionAttempts > 0,
  }));
  useMascot({ isError: !isValid && isSubmitted });

  return (
    <form.AppForm>
      <form.Form className="flex flex-col gap-6">
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
            <form.AppField name="email">
              {(field) => (
                <field.FormField>
                  <field.FieldText
                    type="email"
                    size="lg"
                    placeholder={t('auth:fields.email.label')}
                  />
                </field.FormField>
              )}
            </form.AppField>

            <Button
              loading={form.state.isSubmitting}
              type="submit"
              size="lg"
              className="w-full"
            >
              {t(`${I18N_KEY_PAGE_PREFIX}.loginWithEmail`)}
            </Button>
            <LoginEmailHint form={form} />
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              {t(`${I18N_KEY_PAGE_PREFIX}.spacer`)}
            </span>
          </div>
          <Button
            className="w-full"
            variant="secondary"
            loading={
              social.variables === 'github' &&
              (social.isPending || social.isSuccess)
            }
            size="lg"
            onClick={() => social.mutate('github')}
          >
            {t(`${I18N_KEY_PAGE_PREFIX}.loginWithSocial`, {
              provider: 'GitHub',
            })}
          </Button>
        </div>
      </form.Form>
    </form.AppForm>
  );
}
