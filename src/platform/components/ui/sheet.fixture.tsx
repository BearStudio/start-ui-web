import { Button } from '@/platform/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/platform/components/ui/sheet';
function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary">Open</Button>} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button type="submit">Save changes</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default {
  SheetDemo,
};
