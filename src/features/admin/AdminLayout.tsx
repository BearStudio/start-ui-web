import React, { FC, useContext, useEffect, useMemo, useState } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';

import { Viewport } from '@/components/Viewport';
import { AdminNavBar } from '@/features/admin/AdminNavBar';

type AdminLayoutContextValue = {
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  navIsOpen: boolean;
  navOnOpen: () => void;
  navOnClose: () => void;
};

export const AdminLayoutContext = React.createContext<AdminLayoutContextValue>({
  isFocusMode: false,
  setIsFocusMode: undefined,
  navIsOpen: false,
  navOnOpen: () => undefined,
  navOnClose: () => undefined,
});
export const useAdminLayoutContext = () => useContext(AdminLayoutContext);

export const useAdminLayoutFocusMode = (enabled = true) => {
  const ctx = useAdminLayoutContext();
  const { setIsFocusMode } = ctx || {};

  useEffect(() => {
    setIsFocusMode?.(enabled);
    return () => setIsFocusMode?.(false);
  }, [ctx, setIsFocusMode, enabled]);
};

export const AdminLayout: FC<React.PropsWithChildren<unknown>> = ({
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
    <AdminLayoutContext.Provider value={providerValue}>
      <Viewport>
        {!isFocusMode && <AdminNavBar />}
        <Flex flex="1" direction="column">
          {children}
        </Flex>
      </Viewport>
    </AdminLayoutContext.Provider>
  );
};
