export type Theme = (typeof themes)[number];
export const themes = ['light', 'dark'] as const;

export const DEFAULT_THEME: Theme = 'light';
export const THEME_COOKIE_NAME = 'theme';
