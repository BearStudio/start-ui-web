import { Logo } from '@/platform/components/brand/logo';

import { DemoAppSwitch } from '@/modules/demo/presentation';
import { DemoMarketingBento } from '@/modules/demo/presentation';
import { DemoWelcome } from '@/modules/demo/presentation';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/modules/shell/presentation/app/page-layout';

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
