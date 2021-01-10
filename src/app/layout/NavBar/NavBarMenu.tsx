import React, { useContext } from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useAccount } from '@/app/account/service';

import { NavBarContext } from './NavBarContext';

const NavBarMenuItem = ({ to, ...rest }: any) => {
  const { onClose } = useContext(NavBarContext);
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);
  return (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.8}
      _active={{ bg: 'gray.700' }}
      _hover={{
        bg: 'gray.900',
        _after: {
          opacity: 1,
          w: '2rem',
        },
      }}
      _after={{
        opacity: isActive ? 1 : 0,
        content: '""',
        position: 'absolute',
        left: { base: 8, md: '50%' },
        bottom: '0.2em',
        transform: 'translateX(-50%)',
        transition: '0.2s',
        w: isActive ? '2rem' : 0,
        h: '2px',
        borderRadius: 'full',
        bg: 'currentColor',
      }}
      onClick={onClose}
      {...rest}
    />
  );
};

export const NavBarMenu = (props) => {
  const { isAdmin } = useAccount();
  return (
    <Stack direction="row" spacing="1" {...props}>
      <NavBarMenuItem to="/dashboard">Dashboard</NavBarMenuItem>
      <NavBarMenuItem to="/entity">Entity</NavBarMenuItem>
      {isAdmin && <NavBarMenuItem to="/admin">Admin</NavBarMenuItem>}
    </Stack>
  );
};
