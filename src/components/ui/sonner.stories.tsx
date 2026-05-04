import type { StoryDefault } from '@ladle/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default {
  title: 'Sonner',
} satisfies StoryDefault;

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
