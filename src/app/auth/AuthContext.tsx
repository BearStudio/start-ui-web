import React, { useCallback, useContext, useState } from 'react';

import { isBrowser } from '@/utils/ssr';

interface AuthContextValue {
  isLogged: boolean;
  updateToken(string): void;
}

export const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = React.createContext<AuthContextValue>(null);

const updateToken = (newToken) => {
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

export const AuthProvider = ({ children }) => {
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
        isLogged: !!token,
        updateToken: handleUpdateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
