import React from 'react';

import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuMail, LuUser } from 'react-icons/lu';

import { Nav, NavGroup, NavItem } from '@/components/Nav';
import { LinkAdmin } from '@/features/admin/LinkAdmin';
import { ADMIN_PATH } from '@/features/admin/constants';

export const AdminAccountNav = () => {
  const { t } = useTranslation(['account']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('account:nav.myAccount')}>
        <NavItem
          as={LinkAdmin}
          href="/account/profile"
          isActive={isActive(`${ADMIN_PATH}/account/profile`)}
          icon={LuUser}
        >
          {t('account:nav.profile')}
        </NavItem>
        <NavItem
          as={LinkAdmin}
          href="/account/email"
          isActive={isActive(`${ADMIN_PATH}/account/email`)}
          icon={LuMail}
        >
          {t('account:nav.email')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
