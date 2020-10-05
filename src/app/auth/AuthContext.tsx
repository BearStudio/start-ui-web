import React, { useCallback, useContext, useState } from 'react';
import { isBrowser } from '@/utils/ssr';

interface AuthContextValue {
  isLogged: boolean;
  updateToken(string): void;
}

export const AUTH_TOKEN_KEY = 'authToken';

const AuthContext = React.createContext<AuthContextValue>(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    (isBrowser && localStorage.getItem(AUTH_TOKEN_KEY)) ?? null
  );

  const updateToken = useCallback(
    (newToken) => {
      setToken(newToken);

      if (!isBrowser) {
        return () => {};
      }

      if (!newToken) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } else {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      }
    },
    [setToken]
  );

  return (
    <AuthContext.Provider value={{ isLogged: !!token, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};
