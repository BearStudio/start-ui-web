import { AccountDisplayPreferences } from '@/features/account/account-display-preferences';
import { AccountUserCard } from '@/features/account/account-user-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Account</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <AccountUserCard />
          <AccountDisplayPreferences />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
