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

export const Default = () => (
  <Drawer>
    <DrawerTrigger render={<Button variant="secondary" />}>Open</DrawerTrigger>
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

export const SwipeDirections = () => (
  <div className="flex flex-wrap gap-4">
    {(['down', 'up', 'left', 'right'] as const).map((direction) => (
      <Drawer key={direction} swipeDirection={direction}>
        <DrawerTrigger render={<Button variant="secondary" />}>
          Open {direction}
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
    ))}
  </div>
);
