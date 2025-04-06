import { Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

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
      <PageLayoutContent>
        <div className="flex flex-1 flex-col gap-4">
          <WithPermission
            permission={{ apps: ['app'] }}
            fallback={<span>No App access</span>}
          >
            <Link to="/app">Go to App</Link>
          </WithPermission>
          <MarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
