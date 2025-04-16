import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import { AccountCardRow } from '@/features/account/account-card-row';

export const AccountDisplayPreferences = () => {
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <CardTitle>Display Preferences</CardTitle>
      </CardHeader>
      <AccountCardRow label="Theme">
        <div className="-my-2">
          <ThemeSwitcher />
        </div>
      </AccountCardRow>
      <AccountCardRow label="Language">
        <div className="-my-2">
          <LocalSwitcher />
        </div>
      </AccountCardRow>
    </Card>
  );
};
