'use client';

import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import { Flex, UseDisclosureProps, useDisclosure } from '@chakra-ui/react';

import { Viewport } from '@/components/Viewport';
import { AdminNavBar } from '@/features/admin/AdminNavBar';

export type AdminLayoutContextNavDisplayed = boolean | 'desktop';

type AdminLayoutContextValue = {
  navDisplayed: AdminLayoutContextNavDisplayed;
  setNavDisplayed: React.Dispatch<
    React.SetStateAction<AdminLayoutContextNavDisplayed>
  >;
  navDrawer: UseDisclosureProps;
};

export const AdminLayoutContext =
  React.createContext<AdminLayoutContextValue | null>(null);

export const useAdminLayoutContext = () => {
  const ctx = useContext(AdminLayoutContext);
  if (ctx === null) {
    throw new Error('Missing parent <AdminLayout> component');
  }
  return ctx;
};

export const useAdminLayoutHideNav = (
  displayed: AdminLayoutContextNavDisplayed = true
) => {
  const { setNavDisplayed } = useAdminLayoutContext();

  useEffect(() => {
    setNavDisplayed(displayed);
    return () => setNavDisplayed(true);
  }, [setNavDisplayed, displayed]);
};

export const AdminLayout: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [navDisplayed, setNavDisplayed] =
    useState<AdminLayoutContextNavDisplayed>(true);
  const navDrawer = useDisclosure();

  const providerValue = useMemo(
    () => ({
      navDisplayed,
      setNavDisplayed,
      navDrawer,
    }),
    [navDisplayed, setNavDisplayed, navDrawer]
  );

  return (
    <AdminLayoutContext.Provider value={providerValue}>
      <Viewport
        data-testid="admin-layout"
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
      >
        {!!navDisplayed && (
          <AdminNavBar
            display={
              navDisplayed === 'desktop'
                ? { base: 'none', md: 'block' }
                : undefined
            }
          />
        )}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
      </Viewport>
    </AdminLayoutContext.Provider>
  );
};
