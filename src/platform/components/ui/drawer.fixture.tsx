import { Button } from '@/platform/components/ui/button';
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
} from '@/platform/components/ui/drawer';
const Default = () => (
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

const SwipeDirections = () => (
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

export default {
  Default,
  SwipeDirections,
};
