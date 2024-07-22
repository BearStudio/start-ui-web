import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuMail, LuUser } from 'react-icons/lu';

import { Nav, NavGroup, NavItem } from '@/components/Nav';
import { ROUTES_ACCOUNT } from '@/features/account/routes';

export const AdminAccountNav = () => {
  const { t } = useTranslation(['account']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('account:nav.myAccount')}>
        <NavItem
          as={Link}
          href={ROUTES_ACCOUNT.admin.profile()}
          isActive={isActive(ROUTES_ACCOUNT.admin.profile())}
          icon={LuUser}
        >
          {t('account:nav.profile')}
        </NavItem>
        <NavItem
          as={Link}
          href={ROUTES_ACCOUNT.admin.email()}
          isActive={isActive(ROUTES_ACCOUNT.admin.email())}
          icon={LuMail}
        >
          {t('account:nav.email')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
