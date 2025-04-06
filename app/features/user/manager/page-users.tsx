import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

import { PageLayoutContent } from '@/layout/app/page-layout';
import { PageLayout, PageLayoutTopBar } from '@/layout/manager/page-layout';

export const PageUsers = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageLayoutTopBar>
      <PageLayoutContent>Users...</PageLayoutContent>
    </PageLayout>
  );
};
