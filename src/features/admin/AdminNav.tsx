import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiUsers } from 'react-icons/fi';
import { GoBook } from 'react-icons/go';

import { Nav, NavGroup, NavItem } from '@/components/Nav';

export const AdminNav = () => {
  const { t } = useTranslation(['admin']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('admin:nav.administration')}>
        <NavItem
          as={Link}
          href="/admin/users"
          isActive={isActive('/admin/users')}
          icon={FiUsers}
        >
          {t('admin:nav.users')}
        </NavItem>
        <NavItem
          as={Link}
          href="/admin/api"
          isActive={isActive('/admin/api')}
          icon={GoBook}
        >
          {t('admin:nav.apiDocumentation')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
