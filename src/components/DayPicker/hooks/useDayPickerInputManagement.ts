import { ChangeEvent, ChangeEventHandler, useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { DATE_FORMAT } from '@/components/DayPicker/constants';
import { parseInputToDate } from '@/components/DayPicker/parseInputToDate';

type UseDayPickerInputManagement = {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: (inputValue: string) => void;
};

type UseDayPickerInputManagementParams = {
  dateValue?: Date | null;
  dateFormat: string;
  onChange: (newDate: Date | null, updateMonth?: boolean) => void;
};

export const useDayPickerInputManagement = (
  params: UseDayPickerInputManagementParams
): UseDayPickerInputManagement => {
  const { dateValue, dateFormat, onChange } = params;
  const [inputValue, setInputValue] = useState<string>(
    dateValue ? dayjs(dateValue).format(dateFormat) : ''
  );

  const dateValueAsDayjs = dayjs(dateValue);

  // Pour mettre à jour l'input selon la value
  useEffect(() => {
    if (!!dateValue) {
      setInputValue(dayjs(dateValue).format(dateFormat));
    } else {
      setInputValue('');
    }
  }, [dateFormat, dateValue]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    const date = dayjs(e.currentTarget.value, dateFormat);
    if (date.isValid()) {
      const dateValue = date.startOf('day').toDate();
      onChange(dateValue, true);
    }
  };

  const handleInputBlur = (inputValue: string) => {
    const date = parseInputToDate(inputValue);

    if (!date.isValid()) {
      if (!inputValue) {
        onChange(null);
        return;
      }
      setInputValue(
        dateValueAsDayjs.isValid() ? dateValueAsDayjs.format(dateFormat) : ''
      );
      return;
    }

    const isNewValue = !date.isSame(dateValue, 'date');
    if (!isNewValue) {
      setInputValue(date.format(DATE_FORMAT));
      // Pour éviter le problème de non sélection quand :
      // * L'input est focus avec une valeur déjà sélectionnée
      // * On clique directement sur une nouvelle date
      return;
    }
    if (date.isValid()) {
      onChange(date.toDate());
    }
  };

  return { inputValue, setInputValue, handleInputChange, handleInputBlur };
};
