import { FC } from 'react';

import {
  Box,
  BoxProps,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  forwardRef,
  useBreakpointValue,
  useTheme,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DayModifiers } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { useTranslation } from 'react-i18next';
import { FiCalendar } from 'react-icons/fi';

import { Icon } from '@/components';

const FORMAT = 'DD/MM/YYYY';

const ReactDayPickerInput = forwardRef<InputProps, 'input'>(
  ({ isDisabled, ...rest }, ref) => (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon
          icon={FiCalendar}
          fontSize="lg"
          color={isDisabled ? 'gray.300' : 'gray.400'}
        />
      </InputLeftElement>
      <Input ref={ref} {...rest} />
    </InputGroup>
  )
);

interface DayPickerProps extends Omit<BoxProps, 'onChange'> {
  placeholder?: string;
  value?: string | Date | null;
  onChange?: (date: Date | null | undefined) => void;
  inputProps?: InputProps;
  dayPickerProps?: DayPickerProps;
}

export const DayPicker: FC<DayPickerProps> = ({
  placeholder = FORMAT,
  value = null,
  onChange = () => undefined,
  inputProps = {},
  dayPickerProps = {},
  ...rest
}) => {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isSmartphoneFormat = useBreakpointValue({ base: true, sm: false });

  const formatDate = (date, format) => dayjs(date).format(format);

  const parseDate = (str, format) => {
    const parsed = dayjs(str, format);
    return parsed.isValid() ? parsed.toDate() : null;
  };

  const handleChange = (
    day: Date,
    dayModifiers: DayModifiers,
    dayPickerInput: DayPickerInput
  ) => {
    const inputValue = dayPickerInput?.getInput?.()?.value;
    if (!inputValue) {
      onChange(undefined);
      return;
    }
    const date = dayjs(inputValue, FORMAT);
    onChange(date.isValid() ? date.toDate() : null);
  };

  return (
    <Box {...rest}>
      <DayPickerInput
        component={ReactDayPickerInput}
        onDayChange={handleChange}
        formatDate={formatDate}
        format={FORMAT}
        parseDate={parseDate}
        placeholder={placeholder}
        value={value}
        dayPickerProps={{
          dir: theme.direction,
          locale: i18n.language,
          months: Array.from({ length: 12 }).map((_, i) =>
            dayjs().month(i).format('MMMM')
          ),
          weekdaysLong: Array.from({ length: 7 }).map((_, i) =>
            dayjs()
              .day(i + 1)
              .format('dddd')
          ),
          weekdaysShort: Array.from({ length: 7 }).map((_, i) =>
            dayjs()
              .day(i + 1)
              .format('dd')
          ),
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
