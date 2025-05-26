import { Logo } from '@/components/brand/logo';

import { DemoAppSwitch } from '@/features/demo-mode/demo-app-switch';
import { MarketingBento } from '@/features/demo-mode/marketing-bento';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-24" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-1 flex-col gap-4">
          <DemoAppSwitch />
          <MarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
