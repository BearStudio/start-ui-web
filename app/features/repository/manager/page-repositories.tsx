import { Link } from '@tanstack/react-router';

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
      </PageLayoutTopBar>
      <PageLayoutContent>
        <Link to="/manager/repositories/$id" params={{ id: '1' }}>
          Go to Repo 1
        </Link>
      </PageLayoutContent>
    </PageLayout>
  );
};
