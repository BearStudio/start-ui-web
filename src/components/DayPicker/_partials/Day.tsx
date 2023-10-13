import { useRef } from 'react';

import { Button } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DayProps, useDayRender } from 'react-day-picker';

type CustomDayProps = DayProps;

export const Day: React.FC<React.PropsWithChildren<CustomDayProps>> = ({
  displayMonth,
  date,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { buttonProps, isHidden, isButton, divProps, activeModifiers } =
    useDayRender(date, displayMonth, buttonRef);

  if (isHidden) {
    return <></>;
  }
  if (!isButton) {
    return <div {...divProps} />;
  }

  return (
    <Button
      {...buttonProps}
      ref={buttonRef}
      size="xs"
      borderRadius="full"
      px={0}
      bg="transparent"
      fontWeight="normal"
      isDisabled={activeModifiers.disabled}
      w={8}
      h={8}
    >
      {dayjs(date).format('DD')}
    </Button>
  );
};
