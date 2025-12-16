import { Meta } from '@storybook/react-vite';

import { PageError } from '@/components/errors/page-error';

export default {
  title: 'Errors/Page Error',
} satisfies Meta<typeof PageError>;

export const Error404 = () => {
  return <PageError type="404" />;
};

export const Error403 = () => {
  return <PageError type="403" />;
};

export const ErrorBoundary = () => {
  return <PageError type="error-boundary" />;
};

export const UnknownServerError = () => {
  return <PageError type="unknown-server-error" />;
};

export const UnknownAuthError = () => {
  return <PageError type="unknown-auth-error" />;
};

export const Unknown = () => {
  return <PageError type="unknown" />;
};

export const WithErrorCode = () => {
  return <PageError type="unknown" errorCode="CP304" />;
};

export const WithCustomMessage = () => {
  return (
    <PageError
      type="404"
      message="This book does not exist"
      errorCode="book404"
    />
  );
};
