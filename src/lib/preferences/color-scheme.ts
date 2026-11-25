import {
  type ColorSchemeValue,
  createColorScheme,
  createCookieStorage,
} from '@ui-sdk/core';

export const colorSchemes = [
  'system',
  'light',
  'dark',
] as const satisfies ColorSchemeValue[];

const COOKIE_NAME = 'color-scheme';

const isColorScheme = (value: unknown): value is ColorSchemeValue =>
  colorSchemes.includes(value as ColorSchemeValue);

export const readColorScheme = (cookie?: string | null): ColorSchemeValue => {
  const value = createCookieStorage(COOKIE_NAME, { cookie }).get();
  return isColorScheme(value) ? value : 'system';
};

export const createAppColorScheme = (value: ColorSchemeValue) =>
  createColorScheme({
    defaultValue: value,
    global: true,
    storage: createCookieStorage(COOKIE_NAME),
  });

export type AppColorScheme = ReturnType<typeof createAppColorScheme>;
