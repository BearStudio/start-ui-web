import { SearchInput } from '@/components/ui/search-input';

import { PageLayoutContent } from '@/layout/app/page-layout';
import { PageLayout, PageLayoutTopBar } from '@/layout/manager/page-layout';

export const PageUsers = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Users</h1>
        <SearchInput
          size="sm"
          className="max-w-2xs transition-all focus-within:max-w-lg"
        />
      </PageLayoutTopBar>
      <PageLayoutContent>Users...</PageLayoutContent>
    </PageLayout>
  );
};
