import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';
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
  const social = useMutation({
    mutationFn: async (
      provider: Parameters<typeof authClient.signIn.social>[0]['provider']
    ) => {
      const response = await authClient.signIn.social({
        provider,
        callbackURL: search.redirect ?? '/',
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<FormFieldsLogin>({
    mode: 'onSubmit',
    resolver: zodResolver(zFormFieldsLogin()),
    defaultValues: {
      email: '',
    },
  });

  const submitHandler: SubmitHandler<FormFieldsLogin> = async ({ email }) => {
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
  };

  return (
    <Form {...form} onSubmit={submitHandler} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-4">
          <FormField>
            <FormFieldController
              type="email"
              control={form.control}
              name="email"
              size="lg"
              placeholder={t('auth:data.email.label')}
            />
          </FormField>
          <Button
            loading={form.formState.isSubmitting}
            type="submit"
            size="lg"
            className="w-full"
          >
            {t('auth:login.actions.login')}
          </Button>
        </div>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          className="w-full"
          variant="secondary"
          loading={
            social.variables === 'github' &&
            (social.isPending || social.isSuccess)
          }
          type="button"
          size="lg"
          onClick={() => social.mutate('github')}
        >
          Login with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </Form>
  );
}
