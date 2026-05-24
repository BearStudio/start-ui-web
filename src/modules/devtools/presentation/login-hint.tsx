import { TerminalIcon } from 'lucide-react';

import { useFormContext } from '@/platform/components/form';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/platform/components/ui/alert';

import { AUTH_EMAIL_OTP_MOCKED } from '@/modules/auth/client';
import { envClient } from '@/platform/env/client';

const LoginEmailButton = ({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (value: string) => void;
}) => (
  <button
    type="button"
    className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
    onClick={() => setEmail(email)}
  >
    {email.split('@')[0]}
  </button>
);

export const LoginEmailHint = () => {
  const form = useFormContext();

  if (import.meta.env.PROD && !envClient.VITE_IS_DEMO) {
    return null;
  }

  const setEmail = (value: string) =>
    (
      form as unknown as {
        setFieldValue: (name: 'email', value: string) => void;
      }
    ).setFieldValue('email', value);

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>
        {envClient.VITE_IS_DEMO ? 'Demo mode' : 'Dev mode'}
      </AlertTitle>
      <AlertDescription className="flex flex-wrap gap-x-1 text-sm leading-4">
        You can login with{' '}
        <LoginEmailButton email="admin@admin.com" setEmail={setEmail} />
        {' or '}
        <LoginEmailButton email="user@user.com" setEmail={setEmail} />
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
          onClick={() =>
            (
              form as unknown as {
                setFieldValue: (name: 'otp', value: string) => void;
              }
            ).setFieldValue('otp', AUTH_EMAIL_OTP_MOCKED)
          }
        >
          {AUTH_EMAIL_OTP_MOCKED}
        </button>
      </AlertDescription>
    </Alert>
  );
};
