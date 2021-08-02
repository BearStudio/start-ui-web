import React from 'react';

import { useTranslation } from 'react-i18next';
import { FiUsers } from 'react-icons/fi';
import { GoBook } from 'react-icons/go';
import { Link, useLocation } from 'react-router-dom';

import { Nav, NavItem, NavGroup } from '@/components';

export const AdminNav = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isActive = (to) => pathname.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('admin:nav.administration')}>
        <NavItem
          as={Link}
          to="/admin/users"
          isActive={isActive('/admin/users')}
          icon={FiUsers}
        >
          {t('admin:nav.users')}
        </NavItem>
        <NavItem
          as={Link}
          to="/admin/api"
          isActive={isActive('/admin/api')}
          icon={GoBook}
        >
          {t('admin:nav.apiDocumentation')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
