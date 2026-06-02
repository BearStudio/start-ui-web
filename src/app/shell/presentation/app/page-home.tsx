import { Logo } from '@/platform/components/brand/logo';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/platform/components/page-layout/app';

import { DemoAppSwitch } from '@/app/demo/presentation';
import { DemoMarketingBento } from '@/app/demo/presentation';
import { DemoWelcome } from '@/app/demo/presentation';

export const PageHome = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-24" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col gap-4">
          <DemoWelcome />
          <DemoAppSwitch />
          <DemoMarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
