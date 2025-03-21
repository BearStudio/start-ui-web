import type { Meta } from '@storybook/react';

import { LocalSwitcher } from '@/components/ui/local-switcher';

export default {
  title: 'Local Switcher',
} satisfies Meta<typeof LocalSwitcher>;

export const Default = () => {
  return <LocalSwitcher />;
};
