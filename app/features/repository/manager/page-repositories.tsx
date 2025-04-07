import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';
import { SearchButton } from '@/components/ui/search-button';
import { SearchInput } from '@/components/ui/search-input';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageRepositories = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <ResponsiveIconButton label="New Repo" size="sm">
            <PlusIcon />
          </ResponsiveIconButton>
        }
      >
        <h1 className="overflow-hidden text-base font-medium text-ellipsis md:text-sm">
          Repositories
        </h1>{' '}
        <SearchButton className="-mx-2 md:hidden" size="icon-sm" />
        <SearchInput size="sm" className="max-w-2xs max-md:hidden" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <Link to="/manager/repositories/$id" params={{ id: '1' }}>
          Go to Repo 1
        </Link>
      </PageLayoutContent>
    </PageLayout>
  );
};
