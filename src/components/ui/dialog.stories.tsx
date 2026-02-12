import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default {
  title: 'Dialog',
} satisfies Meta<typeof Dialog>;

export const Default = () => {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        Open
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <DialogBody>Content</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
