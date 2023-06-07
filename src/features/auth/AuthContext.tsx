import React, { FC, useCallback, useContext, useMemo, useState } from 'react';

import { useIsHydrated } from '@/hooks/useIsHydrated';
import { isBrowser } from '@/lib/ssr';

type AuthContextValue = {
  isAuthenticated: boolean;
  updateToken(token?: string | null): void;
};

export const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = React.createContext<AuthContextValue | null>(null);

const updateToken = (newToken?: string | null) => {
  if (!isBrowser) {
    return () => undefined;
  }

  if (!newToken) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
  }
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Missing parent <AuthProvider> component');
  }
  const { isAuthenticated, updateToken } = context;
  const isHydrated = useIsHydrated();

  return {
    isLoading: !isHydrated,
    isAuthenticated,
    updateToken,
  };
};

export const AuthProvider: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [token, setToken] = useState(
    (isBrowser && localStorage.getItem(AUTH_TOKEN_KEY)) ?? null
  );

  const handleUpdateToken = useCallback(
    (newToken: string) => {
      setToken(newToken);
      updateToken(newToken);
    },
    [setToken]
  );

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      updateToken: handleUpdateToken,
    }),
    [handleUpdateToken, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
