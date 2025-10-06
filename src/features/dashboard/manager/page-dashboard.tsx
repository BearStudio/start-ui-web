import { DemoAppSwitch } from '@/features/demo/demo-app-switch'; // !STARTERCONF [demoMode] Remove this import
import { DemoMarketingBento } from '@/features/demo/demo-marketing-bento'; // !STARTERCONF [demoMode] Remove this import
import { DemoWelcome } from '@/features/demo/demo-welcome'; // !STARTERCONF [demoMode] Remove this import
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
          {/* !STARTERCONF [demoMode] Update with your content */}
          <DemoWelcome />
          <DemoAppSwitch />
          <DemoMarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
