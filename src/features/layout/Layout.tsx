import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';

import { Viewport } from '@/components/Viewport';
import { TopBar } from '@/features/layout/TopBar';

type LayoutContextValue = {
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  navIsOpen: boolean;
  navOnOpen: () => void;
  navOnClose: () => void;
};

export const LayoutContext = React.createContext<LayoutContextValue>({
  isFocusMode: false,
  setIsFocusMode: undefined,
  navIsOpen: false,
  navOnOpen: () => undefined,
  navOnClose: () => undefined,
});
export const useLayoutContext = () => useContext(LayoutContext);

export const useLayoutFocusMode = (enabled = true) => {
  const ctx = useLayoutContext();
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    setIsFocusMode?.(enabled);
    return () => setIsFocusMode?.(false);
  }, [ctx, setIsFocusMode, enabled]);
};

export const Layout: FC<React.PropsWithChildren<unknown>> = ({ children }) => {
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
    <LayoutContext.Provider value={providerValue}>
      <Viewport>
        {!isFocusMode && <TopBar />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
      </Viewport>
    </LayoutContext.Provider>
  );
};
