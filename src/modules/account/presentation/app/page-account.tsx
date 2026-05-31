import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AppPageLayout as PageLayout,
  AppPageLayoutContent as PageLayoutContent,
  AppPageLayoutTopBar as PageLayoutTopBar,
} from '@/platform/components/page-layout';

import { DisplayPreferences } from '../display-preferences';
import { UserCard } from '../user-card';

export const PageAccount = (props: { supportSlot?: ReactNode }) => {
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
          {props.supportSlot}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
