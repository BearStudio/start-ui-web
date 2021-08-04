import { FC } from 'react';

import {
  Box,
  Input,
  InputGroup,
  InputProps,
  InputLeftElement,
  useBreakpointValue,
  forwardRef,
  BoxProps,
  useTheme,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DateUtils } from 'react-day-picker';
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
