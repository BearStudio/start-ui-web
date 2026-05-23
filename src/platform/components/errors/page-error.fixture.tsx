import { PageError } from '@/platform/components/errors/page-error';
const Error404 = () => {
  return <PageError type="404" />;
};

const Error403 = () => {
  return <PageError type="403" />;
};

const ErrorBoundary = () => {
  return <PageError type="error-boundary" />;
};

const UnknownServerError = () => {
  return <PageError type="unknown-server-error" />;
};

const UnknownAuthError = () => {
  return <PageError type="unknown-auth-error" />;
};

const Unknown = () => {
  return <PageError type="unknown" />;
};

const WithErrorCode = () => {
  return <PageError type="unknown" errorCode="CP304" />;
};

const WithCustomMessage = () => {
  return (
    <PageError
      type="404"
      message="This book does not exist"
      errorCode="book404"
    />
  );
};

export default {
  Error404,
  Error403,
  ErrorBoundary,
  UnknownServerError,
  UnknownAuthError,
  Unknown,
  WithErrorCode,
  WithCustomMessage,
};
