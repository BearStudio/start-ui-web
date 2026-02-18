import dayjs from 'dayjs';
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  useState,
} from 'react';

import { parseStringToDate } from '@/lib/dayjs/parse-string-to-date';

import { Input } from '@/components/ui/input';

type UseDayPickerInputManagement = {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (inputValue: string) => void;
};
type UseDayPickerInputManagementParams = {
  dateValue?: Date | null;
  dateFormat: string;
  onChange: (newDate: Date | null) => void;
};
export const useDatePickerInputManagement = (
  params: UseDayPickerInputManagementParams
): UseDayPickerInputManagement => {
  const { dateValue, dateFormat, onChange } = params;
  const [inputValue, setInputValue] = useState<string>(
    dateValue ? dayjs(dateValue).format(dateFormat) : ''
  );

  // Update the state if the value or the format changes (adjusting state during render)
  const [prevDateValue, setPrevDateValue] = useState(dateValue);
  const [prevDateFormat, setPrevDateFormat] = useState(dateFormat);
  if (dateValue !== prevDateValue || dateFormat !== prevDateFormat) {
    setPrevDateValue(dateValue);
    setPrevDateFormat(dateFormat);
    setInputValue(dateValue ? dayjs(dateValue).format(dateFormat) : '');
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    const date = dayjs(e.currentTarget.value, dateFormat);
    if (date.isValid()) {
      const dateValue = date.startOf('day').toDate();
      onChange(dateValue);
    }
  };

  const handleInputBlur = (inputValue: string) => {
    const date = dayjs(parseStringToDate(inputValue));

    if (!date.isValid()) {
      if (!inputValue) {
        onChange(null);
        return;
      }

      const dateValueAsDayjs = dayjs(dateValue);
      setInputValue(
        dateValueAsDayjs.isValid() ? dateValueAsDayjs.format(dateFormat) : ''
      );
      return;
    }

    const isNewValue = !date.isSame(dateValue, 'date');
    if (!isNewValue) {
      setInputValue(date.format('DD/MM/YYYY'));
      // To avoid the issue of non-selection when:
      // * The input is focused with an already selected value
      // * A new date is clicked directly
      return;
    }

    onChange(date.toDate());
    setInputValue(date.format(dateFormat));
  };

  return { inputValue, setInputValue, handleInputChange, handleInputBlur };
};

export const DateInput = ({
  onChange,
  onBlur,
  onKeyDown,
  value,
  format = 'DD/MM/YYYY',
  ...props
}: Omit<ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  onChange?: (date: Date | null) => void;
  format?: string;
  value?: Date | null;
}) => {
  const datePickerInputManagement = useDatePickerInputManagement({
    dateFormat: format,
    onChange: onChange ?? (() => undefined),
    dateValue: value,
  });

  return (
    <Input
      onBlur={(e) => {
        datePickerInputManagement.handleInputBlur(e.target.value);
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          datePickerInputManagement.handleInputBlur(e.currentTarget.value);
        }
        onKeyDown?.(e);
      }}
      onChange={datePickerInputManagement.handleInputChange}
      value={
        datePickerInputManagement.inputValue ?? dayjs(value).format(format)
      }
      placeholder={format}
      {...props}
    />
  );
};
