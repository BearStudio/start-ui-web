import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
    mode: 'onSubmit',
    resolver: zodResolver(zFormFieldsLoginVerify()),
    defaultValues: {
      otp: '',
    },
  });

  const submitHandler: SubmitHandler<FormFieldsLoginVerify> = async ({
    otp,
  }) => {
    const { error } = await authClient.signIn.emailOtp({
      email: search.email,
      otp,
    });

    if (error) {
      toast.error(error.message || 'Error'); // TODO Better Errors
      form.setError('otp', {
        message: 'Invalid code', // TODO translation
      });
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
  };

  return (
    <Form
      {...form}
      onSubmit={submitHandler}
      className="flex flex-col gap-6 pb-12"
    >
      <div className="flex flex-col gap-2">
        <Button asChild variant="link">
          <Link to="/login">
            <ArrowLeftIcon />
            {t('common:actions.back')}
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-balance">
          Verification {/* TODO translation */}
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          If you have an account, we have sent a code to{' '}
          <strong>{search.email}</strong>. Enter it below.
          {/* TODO translation */}
          {/* <Trans
            t={t}
            i18nKey="auth:validate.description"
            values={{
              email: search.email,
              expiration: AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES,
            }}
            components={{
              b: <strong />,
            }}
          /> */}
        </p>
        <p className="text-xs text-muted-foreground">
          The code expires shortly ({AUTH_EMAIL_OTP_EXPIRATION_IN_MINUTES}{' '}
          minutes).
        </p>
      </div>
      <div className="grid gap-4">
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
        <Button loading={form.formState.isSubmitting} type="submit" size="lg">
          {t('auth:validate.actions.confirm')}
        </Button>
      </div>
    </Form>
  );
}
