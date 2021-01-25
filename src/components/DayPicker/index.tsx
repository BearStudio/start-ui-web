import { FC } from 'react';

import {
  Box,
  Input,
  InputGroup,
  InputProps,
  InputLeftElement,
  useBreakpointValue,
  forwardRef,
  Icon,
  BoxProps,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DateUtils } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { FiCalendar } from 'react-icons/fi';

const FORMAT = 'DD/MM/YYYY';

const ReactDayPickerInput = forwardRef<InputProps, 'input'>(
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

interface DayPickerProps extends BoxProps {
  placeholder?: string;
  value?: string | Date;
  onChange?: any;
  inputProps?: any;
  dayPickerProps?: any;
}

export const DayPicker: FC<DayPickerProps> = ({
  placeholder = FORMAT,
  value = null,
  onChange = () => {},
  inputProps = {},
  dayPickerProps = {},
  ...rest
}) => {
  const isSmartphoneFormat = useBreakpointValue({ base: true, sm: false });

  const formatDate = (date, format) => dayjs(date).format(format);

  const parseDate = (str, format) => {
    const parsed = dayjs(str, format).toDate();
    return DateUtils.isDate(parsed) ? parsed : null;
  };

  return (
    <Box {...rest}>
      <DayPickerInput
        component={ReactDayPickerInput}
        onDayChange={onChange}
        formatDate={formatDate}
        format={FORMAT}
        parseDate={parseDate}
        placeholder={placeholder}
        value={value}
        dayPickerProps={{
          firstDayOfWeek: 1,
          ...dayPickerProps,
        }}
        inputProps={{
          readOnly: isSmartphoneFormat,
          ...inputProps,
        }}
      />
    </Box>
  );
};
