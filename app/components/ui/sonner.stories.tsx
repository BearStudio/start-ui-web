import { Meta } from '@storybook/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Sonner } from '@/components/ui/sonner';

export default {
  title: 'Sonner',
  parameters: {
    docs: {
      description: {
        component:
          'Find everything about sonner in [Sonner docs](https://sonner.emilkowal.ski/toast)',
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Sonner />
      </div>
    ),
  ],
} satisfies Meta<typeof Sonner>;

export const Default = () => {
  return (
    <Button
      onClick={() =>
        toast.success('Hey there, thanks for checking out Start UI! [web]')
      }
    >
      Show toast
    </Button>
  );
};
