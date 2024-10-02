import { useEffect, useRef, useState } from 'react';

import { Placement, useEventListener, useOutsideClick } from '@chakra-ui/react';
import { usePopper } from 'react-popper';

export type UseDayPickerPopperManagementValue = {
  popperElement?: HTMLDivElement;
  setPopperElement: (value: HTMLDivElement) => void;
  popper: ReturnType<typeof usePopper>;
  isPopperOpen: boolean;
  setIsPopperOpen: (value: boolean) => void;
  togglePopper: (withFocus: boolean) => void;
  openPopper: (withFocus?: boolean) => void;
  closePopper: (withFocus?: boolean) => void;
};

type UseDayPickerPopperManagementParams = {
  containerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  popperPlacement: Placement;
  autoFocus: boolean;
  setIsCalendarFocused: (value: boolean) => void;
  onClosePopper: () => void;
};

export const useDayPickerPopperManagement = (
  params: UseDayPickerPopperManagementParams
): UseDayPickerPopperManagementValue => {
  const {
    containerRef,
    popperPlacement,
    autoFocus,
    setIsCalendarFocused,
    onClosePopper,
    inputRef,
  } = params;
  const [isPopperOpen, setIsPopperOpen] = useState(false);
  const [popperElement, setPopperElement] = useState<
    HTMLDivElement | undefined
  >();

  const popper = usePopper(containerRef.current, popperElement, {
    placement: popperPlacement,
  });

  const togglePopper = (withFocus = false) => {
    if (isPopperOpen) {
      closePopper();
      return;
    }

    openPopper(withFocus);
  };

  // Si on click en dehors du calendrier, on le ferme
  useOutsideClick({
    enabled: isPopperOpen,
    ref: { current: popperElement ?? null },
    handler: () => {
      closePopper();
    },
  });

  const openPopper = (withFocus = false) => {
    if (isPopperOpen) {
      return;
    }
    if (autoFocus && blockAutoFocusOpenPopperRef.current) {
      blockAutoFocusOpenPopperRef.current = false;
      return;
    }
    if (withFocus) {
      setIsCalendarFocused(true);
    }
    setIsPopperOpen(true);
  };

  const closePopper = () => {
    onClosePopper();
    setIsPopperOpen(false);
    setIsCalendarFocused(false);
  };

  useEventListener('keydown', (event) => {
    if (
      document.activeElement === inputRef.current &&
      event?.key?.toLowerCase() === 'arrowdown'
    ) {
      // Si l'input est focus, alors flèche du bas ouvre la popper de DayPicker
      openPopper(true);
    }
    if (
      document.activeElement === inputRef.current &&
      event?.key?.toLowerCase() === 'tab'
    ) {
      // Si l'input est focus, tab ne doit pas rentrer dans la popper de DayPicker
      closePopper();
    }
  });

  // Pour empêcher l'ouverture du calendrier lors de l'autofocus
  const blockAutoFocusOpenPopperRef = useRef(autoFocus);
  useEffect(() => {
    blockAutoFocusOpenPopperRef.current = autoFocus;
  }, [autoFocus]);

  return {
    popperElement,
    setPopperElement,
    popper,
    isPopperOpen,
    setIsPopperOpen,
    togglePopper,
    openPopper,
    closePopper,
  };
};
