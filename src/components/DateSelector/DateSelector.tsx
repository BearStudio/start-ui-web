import { FC, createContext, useContext } from 'react';

import { Flex, useDisclosure } from '@chakra-ui/react';
import dayjs, { Dayjs } from 'dayjs';

type DateSelectorContextType = {
  date: Dayjs;
  onDayClick: (date: Dayjs) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

const DateSelectorContext = createContext<DateSelectorContextType>({
  date: dayjs(),
  onDayClick: () => undefined,
  isOpen: false,
  onOpen: () => undefined,
  onClose: () => undefined,
});
export const useDateSelectorContext = () => useContext(DateSelectorContext);

type DateSelectorProps = {
  date: Dayjs;
  onChange: (date: Dayjs) => void;
};

export const DateSelector: FC<React.PropsWithChildren<DateSelectorProps>> = ({
  date,
  onChange,
  ...rest
}) => {
  const dayPicker = useDisclosure();

  const onDayClick = (d: Dayjs) => {
    onChange(d);
    dayPicker.onClose();
  };

  return (
    <DateSelectorContext.Provider
      value={{
        date,
        onDayClick,
        isOpen: dayPicker.isOpen,
        onClose: dayPicker.onClose,
        onOpen: dayPicker.onOpen,
      }}
    >
      <Flex alignItems="center" {...rest} />
    </DateSelectorContext.Provider>
  );
};
