import React, { FC, useCallback, useContext, useState } from 'react';

import { isBrowser } from '@/utils/ssr';

type AuthContextValue = {
  isAuthenticated: boolean;
  updateToken(token?: string | null): void;
};

export const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = React.createContext<AuthContextValue>(null as TODO);

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

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [token, setToken] = useState(
    (isBrowser && localStorage.getItem(AUTH_TOKEN_KEY)) ?? null
  );

  const handleUpdateToken = useCallback(
    (newToken) => {
      setToken(newToken);
      updateToken(newToken);
    },
    [setToken]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        updateToken: handleUpdateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
