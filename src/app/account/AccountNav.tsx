import React from 'react';

import { FiLock, FiUser } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

import { Nav, NavItem, NavGroup } from '@/components';

export const AccountNav = () => {
  const { pathname } = useLocation();
  const isActive = (to) => pathname.startsWith(to);
  return (
    <Nav>
      <NavGroup title="My Account">
        <NavItem
          as={Link}
          to="/account/profile"
          isActive={isActive('/account/profile')}
          icon={FiUser}
        >
          Profile
        </NavItem>
        <NavItem
          as={Link}
          to="/account/password"
          isActive={isActive('/account/password')}
          icon={FiLock}
        >
          Password
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
