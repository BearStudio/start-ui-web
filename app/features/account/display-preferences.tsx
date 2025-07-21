import { useTranslation } from 'react-i18next';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import { AccountCardRow } from '@/features/account/account-card-row';

export const DisplayPreferences = () => {
  const { t } = useTranslation(['common', 'account']);
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <CardTitle>{t('account:displayPreferences.title')}</CardTitle>
      </CardHeader>
      <AccountCardRow label={t('common:themes.label')}>
        <div className="-my-2">
          <ThemeSwitcher />
        </div>
      </AccountCardRow>
      <AccountCardRow label={t('common:languages.label')}>
        <div className="-my-2">
          <LocalSwitcher />
        </div>
      </AccountCardRow>
    </Card>
  );
};
