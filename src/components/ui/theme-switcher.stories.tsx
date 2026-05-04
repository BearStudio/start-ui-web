import type { StoryDefault } from '@ladle/react';

import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default {
  title: 'Theme Switcher',
} satisfies StoryDefault;

export const Default = () => {
  return <ThemeSwitcher />;
};

export const IconOnly = () => {
  return <ThemeSwitcher iconOnly />;
};
