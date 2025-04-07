import { MarketingBento } from '@/features/demo-mode/marketing-bento';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageDashboard = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Dashboard</h1>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="max-w-4xl">
        <MarketingBento />
      </PageLayoutContent>
    </PageLayout>
  );
};
