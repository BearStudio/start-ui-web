import React, { useState, useRef, FC } from 'react';

import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  forwardRef,
  BoxProps,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FaCalendar } from 'react-icons/fa';

import { DayPicker } from '../DayPicker';

const InputComponent = forwardRef(({ isDisabled, ...otherProps }, ref) => (
  <InputGroup>
    <Input
      ref={ref}
      border="none"
      borderRadius="0"
      focusBorderColor="0"
      backgroundColor="inherit"
      isDisabled={isDisabled}
      {...otherProps}
    />
  </InputGroup>
));

interface DayPickerRangeProps extends BoxProps {
  placeholder?: string;
  value?: string | Date;
  onChange?: any;
  inputProps?: any;
  dayPickerProps?: any;
  onRangeChange?: any;
  fromDayPickerProps?: any;
  toDayPickerProps?: any;
  containerProps?: any;
  isDisabled?: boolean;
}

export const DayPickerRange: FC<DayPickerRangeProps> = ({
  onChange = () => {},
  onRangeChange = () => {},
  fromDayPickerProps = {},
  toDayPickerProps = {},
  dayPickerProps = {},
  containerProps = {},
  inputProps = {},
  isDisabled = false,
  ...props
}) => {
  const [range, setRange] = useState({
    from: fromDayPickerProps.defaultValue || null,
    to: toDayPickerProps.defaultValue || null,
  });
  const toDayPickerRef: any = useRef();

  const showFromMonth = () => {
    const { from, to } = range;

    if (!from) return;
    if (dayjs(to).diff(dayjs(from), 'month') < 2 && toDayPickerRef?.current) {
      const dayPicker = toDayPickerRef.current.getDayPicker();
      if (dayPicker) {
        dayPicker.showMonth(from);
      }
    }
  };

  const handleDayFromClick = (day, modifiers) => {
    if (modifiers.disabled) {
      setRange((previousRange) => ({ ...previousRange, from: null }));
      onChange({ from: null, to: range.to });
      return;
    }

    if (range.to && day && dayjs(range.to).isBefore(dayjs(day))) {
      const toDate = dayjs(range.to);
      const fromDate = dayjs(day);

      if (toDate.isBefore(fromDate, 'date')) {
        setRange({ from: day, to: null });
        onChange({ from: day, to: null });
        return;
      }
    }

    setRange((previousRange) => ({ ...previousRange, from: day }));
    onChange({ from: day, to: range.to });

    if ((!!day && !!range.to) || (!day && !range.to)) {
      onRangeChange({ from: day, to: range.to });
    }
  };

  const handleDayToClick = (day, modifiers) => {
    if (modifiers.disabled) {
      setRange((previousRange) => ({ ...previousRange, to: null }));
      onChange({ from: range.from, to: null });
      return;
    }
    setRange((previousRange) => ({ ...previousRange, to: day }));
    onChange({ from: range.from, to: day });

    if ((!!range.from && !!day) || (!range.from && !day)) {
      onRangeChange({ from: range.from, to: day });
    }
  };

  const { from, to } = range;
  const modifiers = { start: from, end: to };

  const commonProps = {
    defaultProps: {
      placeholder: '',
      component: InputComponent,
    },
    dayPickerProps: {
      selectedDays: [from, { from, to }, to],
      modifiers,
      numberOfMonths: 2,
    },
    containerProps: {
      position: 'static',
      minWidth: '10ch',
      width: '100%',
    },
    inputProps: {
      isDisabled,
      textAlign: 'center',
      p: 0,
    },
  };

  return (
    <InputGroup {...(containerProps.inputGroup || {})}>
      <Input
        as={Flex}
        className="DayPickerRange"
        alignItems="center"
        justifyContent="center"
        w="100%"
        isDisabled={isDisabled}
        {...(containerProps.input || {})}
      >
        <DayPicker
          value={from}
          onChange={handleDayFromClick}
          dayPickerInputProps={{
            ...commonProps.defaultProps,
            ...fromDayPickerProps,
          }}
          {...props}
          dayPickerProps={{
            onDayClick: () => toDayPickerRef?.current?.getInput()?.focus(),
            ...commonProps.dayPickerProps,
            ...(dayPickerProps || {}),
            ...(fromDayPickerProps.dayPickerProps || {}),
          }}
          inputProps={{
            ...commonProps.inputProps,
            ...(inputProps || {}),
            ...(fromDayPickerProps.inputProps || {}),
          }}
          {...commonProps.containerProps}
          {...(fromDayPickerProps.containerProps || {})}
        />
        <Text {...(isDisabled ? { color: 'gray.300' } : {})}>{' - '}</Text>
        <DayPicker
          ref={toDayPickerRef}
          value={to}
          onChange={handleDayToClick}
          onDayPickerShow={showFromMonth}
          dayPickerInputProps={{
            ...commonProps.defaultProps,
            ...toDayPickerProps,
          }}
          {...props}
          {...toDayPickerProps}
          dayPickerProps={{
            disabledDays: { before: from },
            month: from,
            fromMonth: from,
            ...commonProps.dayPickerProps,
            ...(dayPickerProps || {}),
            ...(toDayPickerProps.dayPickerProps || {}),
          }}
          inputProps={{
            ...commonProps.inputProps,
            ...(inputProps || {}),
            ...(toDayPickerProps.inputProps || {}),
          }}
          {...commonProps.containerProps}
          {...(fromDayPickerProps.containerProps || {})}
        />
      </Input>
      <InputRightElement
        color={`gray.${isDisabled ? '200' : '400'}`}
        width="2.75rem"
        zIndex={1}
      >
        <FaCalendar />
      </InputRightElement>
    </InputGroup>
  );
};
