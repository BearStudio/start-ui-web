import { Button } from '@/platform/components/ui/button';
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
} from '@/platform/components/ui/responsive-drawer';
const Default = () => {
  return (
    <ResponsiveDrawer>
      <ResponsiveDrawerTrigger render={<Button variant="secondary" />}>
        Open
      </ResponsiveDrawerTrigger>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>Title</ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription>Description</ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody>Content</ResponsiveDrawerBody>
        <ResponsiveDrawerFooter>
          <ResponsiveDrawerClose render={<Button />}>
            Close
          </ResponsiveDrawerClose>
        </ResponsiveDrawerFooter>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};

export default {
  Default,
};
