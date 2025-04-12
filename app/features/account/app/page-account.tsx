import { Button } from '@/components/ui/button';

import { AccountUserCard } from '@/features/account/account-user-card';
import { useSignOut } from '@/features/auth/utils';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const signOut = useSignOut();
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Account</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <AccountUserCard />

          <div>
            <Button
              onClick={() => signOut.mutate()}
              loading={signOut.isPending || signOut.isSuccess}
            >
              Logout
            </Button>
          </div>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
