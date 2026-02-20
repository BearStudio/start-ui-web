import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import { envClient } from '@/env/client';
import { authClient } from '@/features/auth/client';
import { AUTH_SIGNUP_ENABLED } from '@/features/auth/config';
import { useMascot } from '@/features/auth/mascot';
import { FormFieldsLogin, zFormFieldsLogin } from '@/features/auth/schema';
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
      const callbackURL = search.redirect ?? '/';
      let response;
      try {
        response = await authClient.signIn.social({
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

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(zFormFieldsLogin()),
    defaultValues: {
      email: '',
    },
  });

  const { isValid, isSubmitted } = form.formState;
  useMascot({ isError: !isValid && isSubmitted });

  const submitHandler: SubmitHandler<FormFieldsLogin> = async ({ email }) => {
    let result;
    try {
      result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
    } catch {
      toast.error(t('auth:errorCode.UNKNOWN_ERROR'));
      return;
    }

    if (result.error) {
      const errorMessage = result.error.code
        ? t(
            `auth:errorCode.${result.error.code as unknown as keyof typeof authClient.$ERROR_CODES}`
          )
        : result.error.message || t('auth:errorCode.UNKNOWN_ERROR');
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
  };

  return (
    <Form {...form} onSubmit={submitHandler} className="flex flex-col gap-6">
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
            <FormFieldController
              type="email"
              control={form.control}
              name="email"
              size="lg"
              placeholder={t('auth:common.email.label')}
            />
          </FormField>
          <Button
            loading={form.formState.isSubmitting}
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
