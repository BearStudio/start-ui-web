import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type ReactElement,
  use,
} from 'react';

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
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const BREAKPOINT = 640;

// Parts read the breakpoint from the root so they never render a Drawer part
// inside a Dialog root while media query listeners update one by one.
const IsMobileContext = createContext(false);

export const ResponsiveDrawer = ({
  ...props
}: Overwrite<ComponentProps<typeof Dialog>, ComponentProps<typeof Drawer>>) => {
  const isMobile = useIsMobile(BREAKPOINT);
  return (
    <IsMobileContext value={isMobile}>
      {isMobile ? <Drawer {...props} /> : <Dialog {...props} />}
    </IsMobileContext>
  );
};

export const ResponsiveDrawerTrigger = ({
  ...props
}: ComponentProps<typeof DrawerTrigger> &
  ComponentProps<typeof DialogTrigger>) =>
  use(IsMobileContext) ? (
    <DrawerTrigger {...props} />
  ) : (
    <DialogTrigger {...props} />
  );

export const ResponsiveDrawerClose = (
  props: ComponentProps<typeof DrawerClose | typeof DialogClose>
) =>
  use(IsMobileContext) ? (
    <DrawerClose {...props} />
  ) : (
    <DialogClose {...props} />
  );

// The two parts pass different states to `render` and `style` functions, so
// only their static forms are accepted.
type SharedPartProps<P> = Omit<P, 'render' | 'style'> & {
  render?: ReactElement;
  style?: CSSProperties;
};

export const ResponsiveDrawerOverlay = (
  props: SharedPartProps<ComponentProps<typeof DrawerOverlay>>
) =>
  use(IsMobileContext) ? (
    <DrawerOverlay {...props} />
  ) : (
    <DialogOverlay {...props} />
  );

export const ResponsiveDrawerContent = ({
  hideCloseButton,
  ...props
}: SharedPartProps<ComponentProps<typeof DrawerContent>> & {
  // Only for DialogContent
  hideCloseButton?: boolean;
}) =>
  use(IsMobileContext) ? (
    <DrawerContent {...props} />
  ) : (
    <DialogContent hideCloseButton={hideCloseButton} {...props} />
  );

export const ResponsiveDrawerHeader = (
  props: ComponentProps<typeof DrawerHeader | typeof DialogHeader>
) =>
  use(IsMobileContext) ? (
    <DrawerHeader {...props} />
  ) : (
    <DialogHeader {...props} />
  );

export const ResponsiveDrawerBody = (
  props: ComponentProps<typeof DrawerBody | typeof DialogBody>
) =>
  use(IsMobileContext) ? <DrawerBody {...props} /> : <DialogBody {...props} />;

export const ResponsiveDrawerFooter = (
  props: ComponentProps<typeof DrawerFooter | typeof DialogFooter>
) =>
  use(IsMobileContext) ? (
    <DrawerFooter {...props} />
  ) : (
    <DialogFooter {...props} />
  );

export const ResponsiveDrawerTitle = (
  props: ComponentProps<typeof DrawerTitle | typeof DialogTitle>
) =>
  use(IsMobileContext) ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  );

export const ResponsiveDrawerDescription = (
  props: ComponentProps<typeof DrawerDescription | typeof DialogDescription>
) =>
  use(IsMobileContext) ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  );
