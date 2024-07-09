import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuUsers } from 'react-icons/lu';

import { Nav, NavGroup, NavItem } from '@/components/Nav';
import { ROUTES_USERS } from '@/features/users/routes';

export const AdminNav = () => {
  const { t } = useTranslation(['management']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('management:nav.title')}>
        <NavItem
          as={Link}
          href={ROUTES_USERS.admin.root()}
          isActive={isActive(ROUTES_USERS.admin.root())}
          icon={LuUsers}
        >
          {t('management:nav.users')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
