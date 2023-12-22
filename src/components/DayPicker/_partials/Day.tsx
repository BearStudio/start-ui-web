import { useRef } from 'react';

import { Button } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DayProps, useDayRender } from 'react-day-picker';

type CustomDayProps = DayProps;

export const Day = ({ displayMonth, date }: CustomDayProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { buttonProps, isHidden, isButton, divProps, activeModifiers } =
    useDayRender(date, displayMonth, buttonRef);

  // Here we extract the `style` and 'className' attributes in order to not use it
  // It allow us to make custom style easier
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    style: _unusedStyle,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className: _unusedClassName,
    ...buttonPropsWithoutStyle
  } = buttonProps;

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
      shadow="none"
      p={5}
      boxSize={8}
      isDisabled={activeModifiers.disabled}
      fontWeight={activeModifiers.today ? 'bold' : 'normal'}
      bg={activeModifiers.selected ? 'brand.600' : 'transparent'}
      color={activeModifiers.selected ? 'gray.100' : undefined}
      _hover={{
        bg: activeModifiers.selected ? 'brand.600' : 'gray.100',
        borderColor: 'gray.200',
      }}
      {...disabledStyle}
      _dark={{
        bg: activeModifiers.selected ? 'brand.400' : 'transparent',
        color: 'gray.100',
        _hover: {
          bg: activeModifiers.selected ? 'brand.400' : 'gray.700',
          borderColor: activeModifiers.selected ? 'gray.800' : 'gray.600',
        },
        ...disabledStyle,
      }}
    >
      {dayjs(date).format('DD')}
    </Button>
  );
};
