import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ManagerPageLayout as PageLayout,
  ManagerPageLayoutContent as PageLayoutContent,
  ManagerPageLayoutTopBar as PageLayoutTopBar,
  ManagerPageLayoutTopBarTitle as PageLayoutTopBarTitle,
} from '@/platform/components/page-layout';

import { DisplayPreferences } from '../display-preferences';
import { UserCard } from '../user-card';

export const PageAccount = (props: { supportSlot?: ReactNode }) => {
  const { t } = useTranslation(['account']);
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>{t('account:title')}</PageLayoutTopBarTitle>
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
