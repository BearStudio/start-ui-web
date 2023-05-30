import { FC } from 'react';

import {
  IconButton,
  IconButtonProps,
  useEventListener,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { useDateSelectorContext } from './DateSelector';

type DateSelectorPreviousDayButtonProps = IconButtonProps;

export const DateSelectorPreviousDayButton: FC<
  React.PropsWithChildren<DateSelectorPreviousDayButtonProps>
> = ({ ...rest }) => {
  const { date, onDayClick } = useDateSelectorContext();

  useEventListener('keydown', (event) => {
    if (event?.key?.toLowerCase() === 'arrowleft') {
      onDayClick(date.subtract(1, 'day'));
    }
  });

  return (
    <IconButton
      onClick={() => onDayClick(date.subtract(1, 'day'))}
      icon={<LuChevronLeft />}
      variant="outline"
      {...rest}
    />
  );
};

export const DateSelectorNextDayButton: FC<
  React.PropsWithChildren<DateSelectorPreviousDayButtonProps>
> = ({ ...rest }) => {
  const { date, onDayClick } = useDateSelectorContext();

  useEventListener('keydown', (event) => {
    if (event?.key?.toLowerCase() === 'arrowright') {
      onDayClick(date.add(1, 'day'));
    }
  });

  return (
    <IconButton
      onClick={() => onDayClick(date.add(1, 'day'))}
      icon={<LuChevronRight />}
      variant="outline"
      {...rest}
    />
  );
};
