import React, { useContext } from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useAccount } from '@/app/account/account.service';
import { LayoutContext } from '@/app/layout';

const MainMenuItem = ({ to, ...rest }: any) => {
  const { navOnClose } = useContext(LayoutContext);
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);
  return (
    <Button
      as={RouterLink}
      to={to}
      bg="transparent"
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
      onClick={navOnClose}
      {...rest}
    />
  );
};

export const MainMenu = ({ ...rest }) => {
  const { isAdmin } = useAccount();
  return (
    <Stack direction="row" spacing="1" {...rest}>
      <MainMenuItem to="/dashboard">Dashboard</MainMenuItem>
      {isAdmin && <MainMenuItem to="/admin">Admin</MainMenuItem>}
    </Stack>
  );
};
