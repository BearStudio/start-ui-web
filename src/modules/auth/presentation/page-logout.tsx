import { PageError } from '@/platform/components/errors/page-error';

export const PageLogout = () => {
  return (
    <PageError
      type="unknown-auth-error"
      title="Sign out requires confirmation"
      message="Use the sign out action from your account menu."
      errorCode="405"
    />
  );
};
