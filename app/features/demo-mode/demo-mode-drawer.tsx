import { create } from 'zustand';

import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

type Store = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const useStore = create<Store>()((set) => ({
  open: false,
  setOpen: (open) => set(() => ({ open })),
}));

export const useIsDemoModeDrawerVisible = () => {
  return useStore((state) => state.open);
};

export const openDemoModeDrawer = () => {
  useStore.getState().setOpen(true);
};

export const DemoModeDrawer = () => {
  const open = useStore((state) => state.open);
  const setOpen = useStore((state) => state.setOpen);

  return (
    <ResponsiveDrawer open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <ResponsiveDrawerContent dir="ltr">
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>👋 Demo Mode</ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription>
            This is a <strong>read-only demo</strong>, this action is disabled.
          </ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            You can test the full app starter on your own with the following
            command:
          </p>
          <pre className="rounded-md bg-neutral-800 px-4 py-3 font-mono text-sm text-white">
            <code className="whitespace-break-spaces">
              npx create-start-ui@latest --web myApp
            </code>
          </pre>
          <p className="text-sm text-muted-foreground">
            You can also check the{' '}
            <a
              // eslint-disable-next-line sonarjs/no-clear-text-protocols
              href="http://web.start-ui.com"
              className="text-foreground underline underline-offset-4"
              target="_blank"
              rel="noreferrer noopener"
            >
              README.md
            </a>{' '}
            for more information.
          </p>
          <p className="text-sm text-balance text-muted-foreground">
            Don&apos;t want to do it on your own? This starter is made by the{' '}
            <a
              href="https://bearstudio.fr/en"
              className="text-foreground underline underline-offset-4"
              target="_blank"
              rel="noreferrer noopener"
            >
              BearStudio team
            </a>
            , we will be happy to help you! Contact us at{' '}
            <a
              href="mailto:start-ui@bearstudio.fr"
              className="text-foreground underline underline-offset-4"
              target="_blank"
              rel="noreferrer noopener"
            >
              start-ui@bearstudio.fr
            </a>
          </p>
        </ResponsiveDrawerBody>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
