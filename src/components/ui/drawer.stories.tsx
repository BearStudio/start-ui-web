import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Drawer,
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

export const Default = () => {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Content</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export const DirectionBottom = () => {
  return (
    <Drawer direction="bottom">
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open Bottom
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bottom Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer slides up from the bottom of the screen.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Content</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export const DirectionTop = () => {
  return (
    <Drawer direction="top">
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open Top
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Top Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer slides down from the top of the screen.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Content</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export const DirectionLeft = () => {
  return (
    <Drawer direction="left">
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open Left
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Left Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer slides in from the left side.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Content</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export const DirectionRight = () => {
  return (
    <Drawer direction="right">
      <DrawerTrigger render={<Button variant="secondary" />}>
        Open Right
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Right Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer slides in from the right side.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">Content</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
