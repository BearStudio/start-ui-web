import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import { PageLayoutContent } from '@/layout/app/page-layout';
import { PageLayout, PageLayoutTopBar } from '@/layout/manager/page-layout';

export const PageUsers = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Users</h1>
        <SearchButton className="-mx-2 md:hidden" size="icon-sm" />
        <SearchInput size="sm" className="max-w-2xs max-md:hidden" />
      </PageLayoutTopBar>
      <PageLayoutContent>Users...</PageLayoutContent>
    </PageLayout>
  );
};
