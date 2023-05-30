import React from 'react';

import { useTranslation } from 'react-i18next';
import { LuLock, LuUser } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';

import { Nav, NavGroup, NavItem } from '@/components/Nav';

export const AccountNav = () => {
  const { t } = useTranslation(['account']);
  const { pathname } = useLocation();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('account:nav.myAccount')}>
        <NavItem
          as={Link}
          to="/account/profile"
          isActive={isActive('/account/profile')}
          icon={LuUser}
        >
          {t('account:nav.profile')}
        </NavItem>
        <NavItem
          as={Link}
          to="/account/password"
          isActive={isActive('/account/password')}
          icon={LuLock}
        >
          {t('account:nav.password')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
