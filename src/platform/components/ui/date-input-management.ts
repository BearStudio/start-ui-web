import dayjs from 'dayjs';
import { type ChangeEvent, type ChangeEventHandler, useState } from 'react';

import { parseStringToDate } from '@/platform/lib/dayjs/parse-string-to-date';

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
