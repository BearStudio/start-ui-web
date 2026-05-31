import { TerminalIcon } from 'lucide-react';

import { useTypedAppFormContext } from '@/platform/components/form';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/platform/components/ui/alert';

import {
  AUTH_EMAIL_OTP_MOCKED,
  type FormFieldsLogin,
  type FormFieldsLoginVerify,
} from '@/modules/auth/client';
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
  const form = useTypedAppFormContext({
    defaultValues: { email: '' } satisfies FormFieldsLogin,
  });

  if (
    envClient.VITE_VISUAL_TEST ||
    (import.meta.env.PROD && !envClient.VITE_IS_DEMO)
  ) {
    return null;
  }

  const setEmail = (value: string) => form.setFieldValue('email', value);

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
  const form = useTypedAppFormContext({
    defaultValues: { otp: '' } satisfies FormFieldsLoginVerify,
  });

  if (
    envClient.VITE_VISUAL_TEST ||
    (import.meta.env.PROD && !envClient.VITE_IS_DEMO)
  ) {
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
