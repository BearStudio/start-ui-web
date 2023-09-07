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
import { i18n } from 'i18next';
import DayPicker, { DayPickerProps } from 'react-day-picker';
import ReactFocusLock from 'react-focus-lock';
import { useTranslation } from 'react-i18next';

import { useDateSelectorContext } from './DateSelector';

type ChildrenFunctionParams = { date: Dayjs; i18n: i18n; onOpen: () => void };
type DateSelectorPickerProps = Omit<DayPickerProps, 'children'> & {
  children?({ date, i18n, onOpen }: ChildrenFunctionParams): ReactNode;
};

const defaultChildren = ({ date, i18n, onOpen }: ChildrenFunctionParams) => (
  <chakra.button onClick={onOpen} px="2" type="button">
    {/* we use locale to update date language as changing the global locale doesn't affect existing instances. */}
    {date.locale(i18n.language).format('DD MMM YYYY')}
  </chakra.button>
);

export const DateSelectorPicker: FC<DateSelectorPickerProps> = ({
  children = defaultChildren,
  ...rest
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { date, onDayClick, isOpen, onOpen, onClose } =
    useDateSelectorContext();
  const { i18n } = useTranslation();

  const dayPicker = (
    <DayPicker
      locale={i18n.language}
      initialMonth={date.toDate()}
      selectedDays={[date.toDate()]}
      onDayClick={(d) => onDayClick(dayjs(d))}
      months={Array.from({ length: 12 }).map((_, i) =>
        dayjs().month(i).format('MMMM')
      )}
      weekdaysLong={Array.from({ length: 7 }).map((_, i) =>
        dayjs().day(i).format('dddd')
      )}
      weekdaysShort={Array.from({ length: 7 }).map((_, i) =>
        dayjs().day(i).format('dd')
      )}
      firstDayOfWeek={1}
      {...rest}
    />
  );

  if (isMobile) {
    return (
      <>
        {children({ date, i18n, onOpen })}
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
      <PopoverTrigger>{children({ date, i18n, onOpen })}</PopoverTrigger>
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
            borderRadius="md"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.900' }}
          >
            {dayPicker}
          </PopoverBody>
        </ReactFocusLock>
      </PopoverContent>
    </Popover>
  );
};
