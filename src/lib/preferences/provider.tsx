import { Preferences, usePreference } from '@ui-sdk/react/preferences';
import { createContext, type ReactNode, use } from 'react';

import type { AppColorScheme } from './color-scheme';

const PreferencesContext = createContext<{
  colorScheme: AppColorScheme;
} | null>(null);

export const PreferencesProvider = (props: {
  colorScheme: AppColorScheme;
  children: ReactNode;
}) => {
  return (
    <PreferencesContext value={{ colorScheme: props.colorScheme }}>
      <Preferences preferences={[props.colorScheme]}>
        {props.children}
      </Preferences>
    </PreferencesContext>
  );
};

const usePreferences = () => {
  const preferences = use(PreferencesContext);
  if (!preferences) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return preferences;
};

export const useColorScheme = () => {
  const { colorScheme } = usePreferences();
  return { ...usePreference(colorScheme), set: colorScheme.set };
};
