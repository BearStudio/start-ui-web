import { Link } from '@tanstack/react-router';

import { WithPermission } from '@/lib/auth/with-permission';

import { Logo } from '@/components/brand/logo';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageHome = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar className="md:hidden">
        <Logo className="mx-auto w-24" />
      </PageLayoutTopBar>
      <PageLayoutContent>
        <WithPermission
          permission={{ apps: ['manager'] }}
          fallback={<span>No Manager access</span>}
        >
          <Link to="/manager">Go to Manager</Link>
        </WithPermission>
      </PageLayoutContent>
    </PageLayout>
  );
};
