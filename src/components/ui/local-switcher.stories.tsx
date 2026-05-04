import type { StoryDefault } from '@ladle/react';

import { LocalSwitcher } from '@/components/ui/local-switcher';

export default {
  title: 'Local Switcher',
} satisfies StoryDefault;

export const Default = () => {
  return <LocalSwitcher />;
};

export const IconOnly = () => {
  return <LocalSwitcher iconOnly />;
};
