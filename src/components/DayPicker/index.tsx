import { FC, useState } from 'react';

import {
  Box,
  BoxProps,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  chakra,
  forwardRef,
  useBreakpointValue,
  useTheme,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { DayModifiers } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { useTranslation } from 'react-i18next';
import { LuCalendar } from 'react-icons/lu';
import { usePopper } from 'react-popper';

import { Icon } from '@/components/Icons';

const FORMAT = 'DD/MM/YYYY';

const ReactDayPickerInput = forwardRef<InputProps, 'input'>(
  ({ isDisabled, ...rest }, ref) => (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <Icon
          icon={LuCalendar}
          fontSize="lg"
          color={isDisabled ? 'gray.300' : 'gray.400'}
        />
      </InputLeftElement>
      <Input ref={ref} {...rest} />
    </InputGroup>
  )
);

// DISCLAIMER: This code is written using v7 of react-day-picker. Here are some
// code comments containing permalinks to the v7 documentation as the website
// will move in a near future.

// On v7, react-day-picker doesn't provide typings. Following typings are based
// on the proptypes in the source code.
// https://github.com/gpbl/react-day-picker/blob/v7/src/DayPickerInput.js#L32
type CustomDayPickerOverlayProps = {
  selectedDay?: Date;
  month?: Date;
  input?: Element | null;
  classNames?: Record<string, string>;
};

// The CustomOverlay to control the way the day picker is displayed
// https://github.com/gpbl/react-day-picker/blob/v7/docs/src/code-samples/examples/input-custom-overlay.js
// Check the following permalink for v7 props documentation
// https://github.com/gpbl/react-day-picker/blob/750f6cd808b2ac29772c8df5c497a66e818080e8/docs/src/pages/api/DayPickerInput.js#L163
const CustomDayPickerOverlay = forwardRef<CustomDayPickerOverlayProps, 'div'>(
  (
    { children, input, classNames, selectedDay: _, month: __, ...props },
    ref
  ) => {
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
      null
    );

    const { styles, attributes } = usePopper(input, popperElement, {
      placement: 'bottom-start',
    });

    return (
      <chakra.div className={classNames?.overlayWrapper} {...props} ref={ref}>
        <chakra.div
          ref={setPopperElement}
          className={classNames?.overlay}
          style={styles.popper}
          zIndex="dayPicker"
          {...attributes.popper}
        >
          {children}
        </chakra.div>
      </chakra.div>
    );
  }
);

type CustomProps = {
  placeholder?: string;
  value?: string | Date | null;
  onChange?: (date: Date | null | undefined, isValid: boolean) => void;
  inputProps?: InputProps;
  dayPickerProps?: DayPickerProps;
};

type DayPickerProps = Overwrite<BoxProps, CustomProps>;

export const DayPicker: FC<React.PropsWithChildren<DayPickerProps>> = ({
  id,
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

  const formatDate = (date: Date, format: string) => dayjs(date).format(format);

  const parseDate = (str: string, format: string) => {
    const parsed = dayjs(str, format);
    return parsed.isValid() ? parsed.toDate() : undefined;
  };

  const handleChange = (
    day: Date,
    dayModifiers: DayModifiers,
    dayPickerInput: DayPickerInput
  ) => {
    const inputValue = dayPickerInput?.getInput?.()?.value;
    if (!inputValue) {
      onChange(null, true);
      return;
    }
    const date = dayjs(inputValue, FORMAT);
    const isValid = date.isValid();
    onChange(isValid ? date.toDate() : null, isValid);
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
        value={value ?? undefined}
        keepFocus={false}
        dayPickerProps={{
          dir: theme.direction,
          locale: i18n.language,
          months: Array.from({ length: 12 }).map((_, i) =>
            dayjs().month(i).format('MMMM')
          ),
          weekdaysLong: Array.from({ length: 7 }).map((_, i) =>
            dayjs().day(i).format('dddd')
          ),
          weekdaysShort: Array.from({ length: 7 }).map((_, i) =>
            dayjs().day(i).format('dd')
          ),
          firstDayOfWeek: 1,
          ...dayPickerProps,
        }}
        inputProps={{
          id,
          readOnly: isSmartphoneFormat,
          ...inputProps,
        }}
        overlayComponent={CustomDayPickerOverlay}
      />
    </Box>
  );
};
