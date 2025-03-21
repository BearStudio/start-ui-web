import { useEffect } from 'react';
import { create } from 'zustand';

import { DEFAULT_THEME, Theme, THEME_COOKIE_NAME } from '@/lib/theme/config';

interface ThemeStoreState {
  theme: Theme | null;
  setTheme: (theme: Theme | null) => void;
}

export const useThemeStore = create<ThemeStoreState>()((set) => ({
  theme: null,
  setTheme: (theme) => set(() => ({ theme })),
}));

export const useInitTheme = (initialTheme: Theme | null) => {
  const store = useThemeStore();
  const theme = store.theme ?? initialTheme ?? DEFAULT_THEME;

  const updateTheme = (newTheme: Theme | null) => {
    store.setTheme(newTheme);
  };

  useEffect(() => {
    if (theme !== store.theme) {
      updateTheme(theme);
    }
    // Update the cookie
    document.cookie = `${THEME_COOKIE_NAME}=${theme};max-age=2592000;samesite=lax;path=/`;
  }, [theme]);

  return {
    theme,
    updateTheme,
  };
};

export const useTheme = useThemeStore;
