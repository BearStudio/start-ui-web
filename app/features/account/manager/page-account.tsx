import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/manager/page-layout';

export const PageAccount = () => {
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">Account</h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex gap-4">
          <LocalSwitcher />
          <ThemeSwitcher />
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
