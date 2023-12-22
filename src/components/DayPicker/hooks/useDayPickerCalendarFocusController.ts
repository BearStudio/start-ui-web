import { useEventListener } from '@chakra-ui/react';

type UseDayPickerCalendarFocusController = {
  isCalendarFocused: boolean;
  setIsCalendarFocused: (focused: boolean) => void;
  closeCalendar: () => void;
  onTapEnter: () => void;
};

export const useDayPickerCalendarFocusController = (
  params: UseDayPickerCalendarFocusController
) => {
  const { isCalendarFocused, setIsCalendarFocused, closeCalendar, onTapEnter } =
    params;
  // Seulement lorsque le calendrier est monté
  useEventListener('keydown', (event) => {
    if (event?.key?.toLowerCase() === 'arrowdown') {
      event.preventDefault();
      setIsCalendarFocused(true);
    }
    if (event?.key?.toLowerCase() === 'escape') {
      event.preventDefault();
      closeCalendar();
    }
    if (!isCalendarFocused && event?.key?.toLowerCase() === 'enter') {
      onTapEnter();
      event.preventDefault();
      closeCalendar();
    }
  });
};
