import { Navigate } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

export const PublicOnlyRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};
