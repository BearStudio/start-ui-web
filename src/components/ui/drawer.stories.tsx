import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export default {
  title: 'Drawer',
} satisfies Meta<typeof Drawer>;

const DrawerDemo = ({
  direction,
}: {
  direction?: 'down' | 'up' | 'left' | 'right';
}) => (
  <Drawer swipeDirection={direction}>
    <DrawerTrigger render={<Button variant="secondary" />}>
      Open {direction ?? 'default'}
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Title</DrawerTitle>
        <DrawerDescription>Description</DrawerDescription>
      </DrawerHeader>
      <DrawerBody>Content</DrawerBody>
      <DrawerFooter>
        <DrawerClose render={<Button />}>Close</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

export const Default = () => <DrawerDemo />;

export const SwipeDirections = () => (
  <div className="flex flex-wrap gap-4">
    <DrawerDemo direction="down" />
    <DrawerDemo direction="up" />
    <DrawerDemo direction="left" />
    <DrawerDemo direction="right" />
  </div>
);
