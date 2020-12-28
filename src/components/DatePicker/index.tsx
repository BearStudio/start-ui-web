import { ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react';

import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  useBreakpointValue,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import PropTypes from 'prop-types';
import { DateUtils } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { FaCalendar } from 'react-icons/all';

const FORMAT = 'DD/MM/YYYY';

const ReactDayPickerInput = forwardRef(
  ({ isDisabled, ...otherProps }: any, ref: ForwardedRef<any>) => (
    <InputGroup>
      <Input
        ref={ref}
        bg="gray.50"
        focusBorderColor="brandSecondary.600"
        pr="2.75rem"
        {...otherProps}
      />
      <InputRightElement
        color={`gray.${isDisabled ? '300' : '400'}`}
        width="2.75rem"
      >
        <FaCalendar />
      </InputRightElement>
    </InputGroup>
  )
);

export const DayPicker = ({
  disabledDays,
  defaultValue,
  placeholder,
  onChange,
  dayPickerInputProps,
  dayPickerProps,
  ...props
}) => {
  const [selectedDay, setSelectedDay] = useState(defaultValue);
  const dayPickerInputRef = useRef(null);
  const isSmartphoneFormat = useBreakpointValue({ base: true, sm: false });

  useEffect(() => {
    dayjs.locale('en');
  }, []);
  const handleDayChange = (day) => {
    setSelectedDay(day);
    onChange(day);
  };
  const formatDate = (date, format) => dayjs(date).format(format);

  const parseDate = (str, format) => {
    const parsed = dayjs(str, format).toDate();
    if (DateUtils.isDate(parsed)) {
      return parsed;
    }
    return null;
  };

  return (
    <Box {...props}>
      <DayPickerInput
        ref={dayPickerInputRef}
        component={ReactDayPickerInput}
        onDayChange={handleDayChange}
        value={selectedDay}
        formatDate={formatDate}
        format={FORMAT}
        placeholder={placeholder}
        parseDate={parseDate}
        dayPickerProps={{
          firstDayOfWeek: 1,
          disabledDays,
          ...dayPickerProps,
        }}
        {...dayPickerInputProps}
        inputProps={{
          readOnly: isSmartphoneFormat,
          ...dayPickerInputProps.inputProps,
        }}
      />
    </Box>
  );
};

DayPicker.propTypes = {
  defaultValue: PropTypes.instanceOf(Date),
  disabledDays: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.func,
  ]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  dayPickerInputProps: PropTypes.object, // eslint-disable-line
  dayPickerProps: PropTypes.object, // eslint-disable-line
};

DayPicker.defaultProps = {
  defaultValue: null,
  disabledDays: null,
  placeholder: '',
  onChange: () => {},
  dayPickerInputProps: {},
  dayPickerProps: {},
};
