import { AccountUpdateEmail } from '@/features/account/account-update-email';
import { AccountUserCard } from '@/features/account/account-user-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageAccount = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>Account</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <AccountUserCard />
          <AccountUpdateEmail />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
