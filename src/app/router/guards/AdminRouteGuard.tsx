import { useAccount } from '@/app/account/account.service';
import { Error403, ErrorBoundary } from '@/errors';

export const AdminRouteGuard = ({ children }) => {
  const { isAdmin, isLoading } = useAccount();

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return <Error403 />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
