import { FC, ReactNode } from 'react';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  chakra,
  useBreakpointValue,
} from '@chakra-ui/react';
import dayjs, { Dayjs } from 'dayjs';
import DayPicker, { DayPickerProps } from 'react-day-picker';
import ReactFocusLock from 'react-focus-lock';

import { useDarkMode } from '@/hooks/useDarkMode';

import { useDateSelectorContext } from './DateSelector';

type ChildrenFunctionParams = { date: Dayjs; onOpen: () => void };
interface DateSelectorPickerProps extends Omit<DayPickerProps, 'children'> {
  children?: ({ date, onOpen }: ChildrenFunctionParams) => ReactNode;
}

const defaultChildren = ({ date, onOpen }: ChildrenFunctionParams) => (
  <chakra.button onClick={onOpen} px="2" type="button">
    {date.format('DD MMM YYYY')}
  </chakra.button>
);

export const DateSelectorPicker: FC<DateSelectorPickerProps> = ({
  children = defaultChildren,
  ...rest
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { colorModeValue } = useDarkMode();

  const { date, onDayClick, isOpen, onOpen, onClose } =
    useDateSelectorContext();

  const dayPicker = (
    <DayPicker
      initialMonth={date.toDate()}
      selectedDays={[date.toDate()]}
      onDayClick={(d) => onDayClick(dayjs(d))}
      {...rest}
    />
  );

  if (isMobile) {
    return (
      <>
        {children({ date, onOpen })}
        <Modal isOpen={isOpen} onClose={onClose} size="xs">
          <ModalOverlay />
          <ModalContent>
            <ModalBody>{dayPicker}</ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>{children({ date, onOpen })}</PopoverTrigger>
      <PopoverContent
        minW="0"
        p="0"
        my="2"
        border="none"
        boxShadow="none"
        width="min-content"
      >
        <ReactFocusLock>
          <PopoverBody
            p="0"
            border="1px solid"
            borderColor={colorModeValue('gray.200', 'gray.900')}
            borderRadius="md"
          >
            {dayPicker}
          </PopoverBody>
        </ReactFocusLock>
      </PopoverContent>
    </Popover>
  );
};
