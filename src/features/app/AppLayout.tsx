import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';

import { Viewport } from '@/components/Viewport';
import { AppNavBarDesktop } from '@/features/app/AppNavBarDesktop';
import { AppNavBarMobile } from '@/features/app/AppNavBarMobile';

type AppLayoutContextValue = {
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  navIsOpen: boolean;
  navOnOpen: () => void;
  navOnClose: () => void;
};

export const AppLayoutContext = React.createContext<AppLayoutContextValue>({
  isFocusMode: false,
  setIsFocusMode: undefined,
  navIsOpen: false,
  navOnOpen: () => undefined,
  navOnClose: () => undefined,
});
export const useAppLayoutContext = () => useContext(AppLayoutContext);

export const useAppLayoutFocusMode = (enabled = true) => {
  const ctx = useAppLayoutContext();
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    setIsFocusMode?.(enabled);
    return () => setIsFocusMode?.(false);
  }, [ctx, setIsFocusMode, enabled]);
};

export const AppLayout: FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const nav = useDisclosure();

  const providerValue = useMemo(
    () => ({
      isFocusMode,
      setIsFocusMode,
      navIsOpen: nav.isOpen,
      navOnClose: nav.onClose,
      navOnOpen: nav.onOpen,
    }),
    [isFocusMode, nav.isOpen, nav.onClose, nav.onOpen]
  );

  return (
    <AppLayoutContext.Provider value={providerValue}>
      <Viewport>
        {!isFocusMode && <AppNavBarDesktop />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
        {!isFocusMode && <AppNavBarMobile />}
      </Viewport>
    </AppLayoutContext.Provider>
  );
};
