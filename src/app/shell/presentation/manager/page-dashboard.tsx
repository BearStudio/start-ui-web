import { DemoAppSwitch } from '@/app/demo/presentation';
import { DemoMarketingBento } from '@/app/demo/presentation';
import { DemoWelcome } from '@/app/demo/presentation';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/platform/components/page-layout/manager';

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
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
