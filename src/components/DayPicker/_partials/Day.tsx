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

  // Here we extract the `style` attribute in order to not use it
  // it was used before, but the style is inlined in the button and
  // makes the dark style hard to override
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { style: _unusedStyle, ...buttonPropsWithoutStyle } = buttonProps;

  if (isHidden) {
    return <></>;
  }
  if (!isButton) {
    return <div {...divProps} />;
  }

  const disabledStyle = {
    _disabled: {
      border: 'transparent',
      bg: 'transparent',
      color: 'gray.400',
      cursor: 'not-allowed',
    },
  };

  return (
    <Button
      {...buttonPropsWithoutStyle}
      ref={buttonRef}
      variant="outline"
      size="xs"
      borderRadius="full"
      borderColor="transparent"
      _dark={{
        color: 'gray.200',
        _hover: {
          bg: 'transparent',
          borderColor: 'gray.500',
        },
        ...disabledStyle,
      }}
      px={0}
      bg="transparent"
      fontWeight={activeModifiers.today ? 'bold' : 'normal'}
      isDisabled={activeModifiers.disabled}
      {...disabledStyle}
      w={8}
      h={8}
    >
      {dayjs(date).format('DD')}
    </Button>
  );
};
