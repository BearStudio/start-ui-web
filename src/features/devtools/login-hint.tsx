import { TerminalIcon } from 'lucide-react';

import { useFormContext } from '@/components/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { envClient } from '@/env/client';
import { AUTH_EMAIL_OTP_MOCKED } from '@/features/auth/config';

const LoginEmailButton = ({
  email,
  form,
}: {
  email: string;
  form: ReturnType<typeof useFormContext>;
}) => (
  <button
    type="button"
    className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
    onClick={() => form.setFieldValue('email', email)}
  >
    {email.split('@')[0]}
  </button>
);

export const LoginEmailHint = () => {
  const form = useFormContext();

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return null;
  }

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex flex-wrap gap-x-1 text-sm leading-4">
        You can login with{' '}
        <LoginEmailButton email="admin@admin.com" form={form} />
        {' or '}
        <LoginEmailButton email="user@user.com" form={form} />
      </AlertDescription>
    </Alert>
  );
};

export const LoginEmailOtpHint = () => {
  const form = useFormContext();

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return null;
  }

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex text-sm leading-4">
        Use the code{' '}
        <button
          type="button"
          className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
          onClick={() => form.setFieldValue('otp', AUTH_EMAIL_OTP_MOCKED)}
        >
          {AUTH_EMAIL_OTP_MOCKED}
        </button>
      </AlertDescription>
    </Alert>
  );
};
