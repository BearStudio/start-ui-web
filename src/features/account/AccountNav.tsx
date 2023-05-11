import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiLock, FiUser } from 'react-icons/fi';

import { Nav, NavGroup, NavItem } from '@/components/Nav';

export const AccountNav = () => {
  const { t } = useTranslation(['account']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('account:nav.myAccount')}>
        <NavItem
          as={Link}
          href="/account/profile"
          isActive={isActive('/account/profile')}
          icon={FiUser}
        >
          {t('account:nav.profile')}
        </NavItem>
        <NavItem
          as={Link}
          href="/account/password"
          isActive={isActive('/account/password')}
          icon={FiLock}
        >
          {t('account:nav.password')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
