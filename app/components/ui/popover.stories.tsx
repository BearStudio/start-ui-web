import type { Meta } from '@storybook/react';
import { useDisclosure } from 'react-use-disclosure';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'Popover',
} satisfies Meta<typeof Popover>;

export const Default = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Click me</Button>
      </PopoverTrigger>
      <PopoverContent>The content</PopoverContent>
    </Popover>
  );
};

export const Controlled = () => {
  const popover = useDisclosure();

  return (
    <>
      <Popover
        open={popover.isOpen}
        onOpenChange={(open) => popover.toggle(open)}
      >
        <PopoverTrigger asChild>
          <Button>Click me</Button>
        </PopoverTrigger>
        <PopoverContent>The content</PopoverContent>
      </Popover>

      <Button onClick={() => popover.open()}>Open the popover</Button>
    </>
  );
};
