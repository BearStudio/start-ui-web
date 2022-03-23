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

export const DateSelector: FC<DateSelectorProps> = ({
  date,
  onChange,
  ...rest
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const onDayClick = (d: Dayjs) => {
    onChange(d);
    onClose();
  };

  return (
    <DateSelectorContext.Provider
      value={{ date, onDayClick, isOpen, onClose, onOpen }}
    >
      <Flex alignItems="center" {...rest} />
    </DateSelectorContext.Provider>
  );
};
