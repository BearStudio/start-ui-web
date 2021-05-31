import React, { useContext } from 'react';

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
