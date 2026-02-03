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

import { DemoAppSwitch } from '@/features/demo/demo-app-switch';
import { DemoMarketingBento } from '@/features/demo/demo-marketing-bento';
import { DemoWelcome } from '@/features/demo/demo-welcome';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageDashboard = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Dashboard</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-4xl">
        <div className="flex flex-col gap-4">
          <DemoWelcome />
          <DemoAppSwitch />
          <DemoMarketingBento />

          {/* Drawer Example */}
          <Drawer>
            <DrawerTrigger render={<Button variant="secondary" />}>
              Open Drawer
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer Title</DrawerTitle>
                <DrawerDescription>
                  This is an example drawer component.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <p>Drawer content goes here.</p>
              </div>
              <DrawerFooter>
                <DrawerClose render={<Button />}>Close</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
