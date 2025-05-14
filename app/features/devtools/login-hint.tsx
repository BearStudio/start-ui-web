import { TerminalIcon } from 'lucide-react';

import { AUTH_EMAIL_OTP_MOCKED } from '@/lib/auth/config';
import { useFormContext } from '@/lib/form/context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { envClient } from '@/env/client';
import { FormFieldsLoginVerify } from '@/features/auth/schema';

const mockedEmail = 'admin@admin.com';

export const LoginEmailHint = () => {
  const form = useFormContext<{ email: string }>();

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return <></>;
  }

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex flex-wrap text-sm leading-4">
        You can login with{' '}
        <button
          type="button"
          className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
          onClick={() => form.setFieldValue('email', () => mockedEmail)}
        >
          {mockedEmail}
        </button>
      </AlertDescription>
    </Alert>
  );
};

export const LoginEmailOtpHint = () => {
  const form = useFormContext<FormFieldsLoginVerify>();

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return <></>;
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
          onClick={() => form.setFieldValue('otp', () => AUTH_EMAIL_OTP_MOCKED)}
        >
          {AUTH_EMAIL_OTP_MOCKED}
        </button>
      </AlertDescription>
    </Alert>
  );
};
