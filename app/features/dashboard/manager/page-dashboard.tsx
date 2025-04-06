import { Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageDashboard = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
