import { authClient } from '@/lib/auth/client';

import { Button } from '@/components/ui/button';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import { useSignOut } from '@/features/auth/utils';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const session = authClient.useSession();
  const signOut = useSignOut();
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="overflow-hidden text-base font-bold text-ellipsis">
          Account
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex gap-4">
          <LocalSwitcher />
          <ThemeSwitcher />

          <div>
            {session.data?.user.email}
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
