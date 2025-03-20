import type { Meta } from '@storybook/react';

import { Spinner } from '@/components/ui/spinner';

export default {
  title: 'Spinner',
} satisfies Meta<typeof Spinner>;

export const Default = () => {
  return <Spinner />;
};

export const Full = () => {
  return (
    <div className="flex h-48 flex-col">
      <Spinner full />
    </div>
  );
};
