'use client';

import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import { Flex, UseDisclosureProps, useDisclosure } from '@chakra-ui/react';

import { Viewport } from '@/components/Viewport';
import { AppNavBarDesktop } from '@/features/app/AppNavBarDesktop';
import { AppNavBarMobile } from '@/features/app/AppNavBarMobile';

export type AppLayoutContextNavDisplayed = boolean | 'desktop';

type AppLayoutContextValue = {
  navDisplayed: AppLayoutContextNavDisplayed;
  setNavDisplayed: React.Dispatch<
    React.SetStateAction<AppLayoutContextNavDisplayed>
  >;
  navDrawer: UseDisclosureProps;
};

export const AppLayoutContext =
  React.createContext<AppLayoutContextValue | null>(null);

export const useAppLayoutContext = () => {
  const ctx = useContext(AppLayoutContext);
  if (ctx === null) {
    throw new Error('Missing parent <AppLayout> component');
  }
  return ctx;
};

export const useAppLayoutHideNav = (
  displayed: AppLayoutContextNavDisplayed = true
) => {
  const { setNavDisplayed } = useAppLayoutContext();

  useEffect(() => {
    setNavDisplayed(displayed);
    return () => setNavDisplayed(true);
  }, [setNavDisplayed, displayed]);
};

export const AppLayout: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [navDisplayed, setNavDisplayed] =
    useState<AppLayoutContextNavDisplayed>(true);
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
    <AppLayoutContext.Provider value={providerValue}>
      <Viewport
        data-testid="app-layout"
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
      >
        {!!navDisplayed && <AppNavBarDesktop />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
        {navDisplayed === true && <AppNavBarMobile />}
      </Viewport>
    </AppLayoutContext.Provider>
  );
};
