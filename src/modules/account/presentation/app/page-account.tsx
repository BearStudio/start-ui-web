import { useTranslation } from 'react-i18next';

import { Button } from '@/platform/components/ui/button';

import { DisplayPreferences } from '@/modules/account/presentation/display-preferences';
import { UserCard } from '@/modules/account/presentation/user-card';
import { BuildInfoDrawer } from '@/modules/build-info/presentation';
import { BuildInfoVersion } from '@/modules/build-info/presentation';
import {
  AppPageLayout as PageLayout,
  AppPageLayoutContent as PageLayoutContent,
  AppPageLayoutTopBar as PageLayoutTopBar,
} from '@/modules/shell/presentation';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">
          {t('account:title')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <UserCard />
          <DisplayPreferences />
          <BuildInfoDrawer>
            <Button variant="ghost" size="xs" className="opacity-60">
              <BuildInfoVersion />
            </Button>
          </BuildInfoDrawer>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
