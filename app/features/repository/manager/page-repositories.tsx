import { Link } from '@tanstack/react-router';

import { SearchInput } from '@/components/ui/search-input';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageRepositories = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Repositories</h1>
        <SearchInput
          size="sm"
          className="max-w-2xs transition-all focus-within:max-w-lg"
        />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <Link to="/manager/repositories/$id" params={{ id: '1' }}>
          Go to Repo 1
        </Link>
      </PageLayoutContent>
    </PageLayout>
  );
};
