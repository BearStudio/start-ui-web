import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

export default {
  title: 'ResponsiveDrawer',
} satisfies Meta<typeof ResponsiveDrawer>;

export const Default = () => {
  return (
    <ResponsiveDrawer>
      <ResponsiveDrawerTrigger asChild>
        <Button variant="secondary">Open</Button>
      </ResponsiveDrawerTrigger>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>Title</ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription>Description</ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody>Content</ResponsiveDrawerBody>
        <ResponsiveDrawerFooter>
          <ResponsiveDrawerClose asChild>
            <Button>Close</Button>
          </ResponsiveDrawerClose>
        </ResponsiveDrawerFooter>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
