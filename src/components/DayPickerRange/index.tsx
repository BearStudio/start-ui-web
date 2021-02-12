import React, { useState, useRef, FC } from 'react';

import {
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Text,
  forwardRef,
  BoxProps,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { FaCalendar } from 'react-icons/fa';
import { FiCalendar } from 'react-icons/fi';

import { DayPicker, DayPickerProps } from '../DayPicker';

const InputComponent = forwardRef<InputProps, 'input'>(
  ({ isDisabled, ...rest }, ref) => (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon
          as={FiCalendar}
          fontSize="lg"
          color={isDisabled ? 'gray.300' : 'gray.400'}
        />
      </InputLeftElement>
      <Input ref={ref} {...rest} />
    </InputGroup>
  )
);

interface DayPickerRangeProps extends BoxProps {
  placeholder?: string;
  value?: string | Date;
  onChange?: any;
  inputProps?: any;
  dayPickerProps?: any;
  onRangeChange: any;
  fromDayPickerProps: any;
  toDayPickerProps: any;
  containerProps: any;
  isDisabled: boolean;
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
      isDisabled,
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
          onDayChange={handleDayFromClick}
          isDisabled={isDisabled}
          {...commonProps.defaultProps}
          {...props}
          {...fromDayPickerProps}
          dayPickerProps={{
            onDayClick: () => toDayPickerRef?.current?.getInput()?.focus(),
            ...commonProps.dayPickerProps,
            ...(dayPickerProps || {}),
            ...(fromDayPickerProps.dayPickerProps || {}),
          }}
          containerProps={{
            ...commonProps.containerProps,
            ...(fromDayPickerProps.containerProps || {}),
          }}
          inputProps={{
            ...commonProps.inputProps,
            ...(inputProps || {}),
            ...(fromDayPickerProps.inputProps || {}),
          }}
        />
        <Text {...(isDisabled ? { color: 'gray.300' } : {})}>{' - '}</Text>
        <DayPicker
          ref={toDayPickerRef}
          value={to}
          onDayChange={handleDayToClick}
          onDayPickerShow={showFromMonth}
          isDisabled={isDisabled}
          {...commonProps.defaultProps}
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
          containerProps={{
            ...commonProps.containerProps,
            ...(toDayPickerProps.containerProps || {}),
          }}
          inputProps={{
            ...commonProps.inputProps,
            ...(inputProps || {}),
            ...(toDayPickerProps.inputProps || {}),
          }}
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

DayPickerRange.propTypes = {
  onChange: PropTypes.func,
  onRangeChange: PropTypes.func,
  fromDayPickerProps: PropTypes.object,
  toDayPickerProps: PropTypes.object,
  dayPickerProps: PropTypes.object,
  containerProps: PropTypes.object,
  inputProps: PropTypes.object,
  isDisabled: PropTypes.bool,
};

DayPickerRange.defaultProps = {
  onChange: () => {},
  onRangeChange: () => {},
  fromDayPickerProps: {},
  toDayPickerProps: {},
  dayPickerProps: {},
  containerProps: { inputGroup: {}, input: {} },
  inputProps: {},
  isDisabled: false,
};
