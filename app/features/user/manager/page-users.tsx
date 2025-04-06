import { PageLayoutContent } from '@/layout/app/page-layout';
import { PageLayout, PageLayoutTopBar } from '@/layout/manager/page-layout';

export const PageUsers = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Users</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>Users...</PageLayoutContent>
    </PageLayout>
  );
};
