import { TerminalIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { AUTH_EMAIL_OTP_MOCKED } from '@/lib/auth/config';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { envClient } from '@/env/client';

export const LoginEmailHint = () => {
  const form = useFormContext();
  const mockedEmail = 'admin@admin.com';

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return null;
  }

  return (
    <Alert>
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex text-sm leading-4">
        You can login with{' '}
        <button
          type="button"
          className="cursor-pointer font-medium text-primary underline underline-offset-4 hover:no-underline"
          onClick={() => form.setValue('email', mockedEmail)}
        >
          {mockedEmail}
        </button>
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
    <Alert>
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex text-sm leading-4">
        Use the code{' '}
        <button
          type="button"
          className="cursor-pointer font-medium text-primary underline underline-offset-4 hover:no-underline"
          onClick={() => form.setValue('otp', AUTH_EMAIL_OTP_MOCKED)}
        >
          {AUTH_EMAIL_OTP_MOCKED}
        </button>
      </AlertDescription>
    </Alert>
  );
};
