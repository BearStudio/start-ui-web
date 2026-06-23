import { type ChangeEvent, type ChangeEventHandler, useState } from 'react';

import {
  formatDate,
  isSameDate,
  parseDateByFormat,
  parseStringToDate,
} from '@/platform/lib/temporal/date-time';

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

const INPUT_SEPARATOR_PATTERN = /[ ./\-_]+/g;

const getBlurDateFormats = (dateFormat: string) => {
  const compactFormat = dateFormat.replace(INPUT_SEPARATOR_PATTERN, '');

  return compactFormat === dateFormat
    ? [dateFormat]
    : [dateFormat, compactFormat];
};

export const useDatePickerInputManagement = (
  params: UseDayPickerInputManagementParams
): UseDayPickerInputManagement => {
  const { dateValue, dateFormat, onChange } = params;
  const [inputValue, setInputValue] = useState<string>(
    formatDate(dateValue, dateFormat)
  );

  // Update the state if the value or the format changes (adjusting state during render)
  const [prevDateValue, setPrevDateValue] = useState(dateValue);
  const [prevDateFormat, setPrevDateFormat] = useState(dateFormat);
  if (dateValue !== prevDateValue || dateFormat !== prevDateFormat) {
    setPrevDateValue(dateValue);
    setPrevDateFormat(dateFormat);
    setInputValue(formatDate(dateValue, dateFormat));
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    const date = parseDateByFormat(e.currentTarget.value, dateFormat);
    if (!Number.isNaN(date.getTime())) {
      onChange(date);
    }
  };

  const handleInputBlur = (inputValue: string) => {
    const date = parseStringToDate(inputValue, getBlurDateFormats(dateFormat), {
      includeDefaultFormats: false,
    });

    if (Number.isNaN(date.getTime())) {
      if (!inputValue) {
        onChange(null);
        return;
      }

      setInputValue(formatDate(dateValue, dateFormat));
      return;
    }

    const isNewValue = !isSameDate(date, dateValue);
    if (!isNewValue) {
      setInputValue(formatDate(date, dateFormat));
      // To avoid the issue of non-selection when:
      // * The input is focused with an already selected value
      // * A new date is clicked directly
      return;
    }

    onChange(date);
    setInputValue(formatDate(date, dateFormat));
  };

  return { inputValue, setInputValue, handleInputChange, handleInputBlur };
};
