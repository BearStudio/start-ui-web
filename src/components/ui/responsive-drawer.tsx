import { type ComponentProps } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const BREAKPOINT = 640;

export const ResponsiveDrawer = (
  props: ComponentProps<typeof Drawer> & ComponentProps<typeof Dialog>
) => (
  <Drawer {...props}>
    <Dialog {...props} />
  </Drawer>
);

export const ResponsiveDrawerTrigger = (
  props: ComponentProps<typeof DrawerTrigger> &
    ComponentProps<typeof DialogTrigger>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerTrigger {...props} />
  ) : (
    <DialogTrigger {...props} />
  );

export const ResponsiveDrawerPortal = (
  props: ComponentProps<typeof DrawerPortal> &
    ComponentProps<typeof DialogPortal>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerPortal {...props} />
  ) : (
    <DialogPortal {...props} />
  );

export const ResponsiveDrawerClose = (
  props: ComponentProps<typeof DrawerClose> & ComponentProps<typeof DialogClose>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerClose {...props} />
  ) : (
    <DialogClose {...props} />
  );

export const ResponsiveDrawerOverlay = (
  props: ComponentProps<typeof DrawerOverlay> &
    ComponentProps<typeof DialogOverlay>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerOverlay {...props} />
  ) : (
    <DialogOverlay {...props} />
  );

export const ResponsiveDrawerContent = (
  props: ComponentProps<typeof DrawerContent> &
    ComponentProps<typeof DialogContent>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerContent {...props} />
  ) : (
    <DialogContent {...props} />
  );

export const ResponsiveDrawerHeader = (
  props: ComponentProps<typeof DrawerHeader> &
    ComponentProps<typeof DialogHeader>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerHeader {...props} />
  ) : (
    <DialogHeader {...props} />
  );

export const ResponsiveDrawerBody = (
  props: ComponentProps<typeof DrawerBody> & ComponentProps<typeof DialogBody>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerBody {...props} />
  ) : (
    <DialogBody {...props} />
  );

export const ResponsiveDrawerFooter = (
  props: ComponentProps<typeof DrawerFooter> &
    ComponentProps<typeof DialogFooter>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerFooter {...props} />
  ) : (
    <DialogFooter {...props} />
  );

export const ResponsiveDrawerTitle = (
  props: ComponentProps<typeof DrawerTitle> & ComponentProps<typeof DialogTitle>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  );

export const ResponsiveDrawerDescription = (
  props: ComponentProps<typeof DrawerDescription> &
    ComponentProps<typeof DialogDescription>
) =>
  useIsMobile(BREAKPOINT) ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  );
