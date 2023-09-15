import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuUser } from 'react-icons/lu';

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
          icon={LuUser}
        >
          {t('account:nav.profile')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
