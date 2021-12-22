import { Redirect } from 'react-router-dom';

import { useAuthContext } from '@/app/auth/AuthContext';

export const PublicOnlyRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  return isAuthenticated ? <Redirect to="/" /> : children;
};
