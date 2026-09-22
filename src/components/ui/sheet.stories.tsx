import type { Meta } from '@storybook/react-vite';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default {
  title: 'Sheet',
} satisfies Meta<typeof Sheet>;

export function SheetDemo() {
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

const SIDES = [
  'inline-start',
  'inline-end',
  'left',
  'right',
  'top',
  'bottom',
] as const;

export function Sides() {
  return (
    <div className="flex flex-wrap gap-2">
      {SIDES.map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="secondary">{side}</Button>} />
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Side: {side}</SheetTitle>
              <SheetDescription>
                Physical sides stay put, inline sides follow the text direction.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose render={<Button>Close</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
