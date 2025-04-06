import { Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

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
        <WithPermission
          permission={{ apps: ['app'] }}
          fallback={<span>No App access</span>}
        >
          <Link to="/app">Go to App</Link>
        </WithPermission>
      </PageLayoutContent>
    </PageLayout>
  );
};
