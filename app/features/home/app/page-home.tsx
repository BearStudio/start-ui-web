import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/brand/logo';

import { WithPermissions } from '@/features/auth/with-permission';
import { MarketingBento } from '@/features/demo-mode/marketing-bento';
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
        <div className="flex flex-1 flex-col gap-4">
          <WithPermissions
            permissions={[{ apps: ['manager'] }]}
            fallback={<span>No Manager access</span>}
          >
            <Link to="/manager">Go to Manager</Link>
          </WithPermissions>
          <MarketingBento />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
