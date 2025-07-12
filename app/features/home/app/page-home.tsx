import { Logo } from '@/components/brand/logo';

import { DemoAppSwitch } from '@/features/demo/demo-app-switch'; // !STARTERCONF [demoMode] Remove this import
import { DemoMarketingBento } from '@/features/demo/demo-marketing-bento'; // !STARTERCONF [demoMode] Remove this import
import { DemoWelcome } from '@/features/demo/demo-welcome'; // !STARTERCONF [demoMode] Remove this import
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
          {/* !STARTERCONF [demoMode] Update with your content */}
          <DemoWelcome />
          <DemoAppSwitch />
          <DemoMarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
