import dayjs from 'dayjs';
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  useEffect,
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
  onChange: (newDate: Date | null, updateMonth?: boolean) => void;
};
export const useDatePickerInputManagement = (
  params: UseDayPickerInputManagementParams
): UseDayPickerInputManagement => {
  const { dateValue, dateFormat, onChange } = params;
  const [inputValue, setInputValue] = useState<string>(
    dateValue ? dayjs(dateValue).format(dateFormat) : ''
  );

  // To update the state if the value of the format change
  useEffect(() => {
    if (dateValue) {
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
      // Pour éviter le problème de non sélection quand :
      // * L'input est focus avec une valeur déjà sélectionnée
      // * On clique directement sur une nouvelle date
      return;
    }

    onChange(date.toDate());
    setInputValue(date.format(dateFormat));
  };

  return { inputValue, setInputValue, handleInputChange, handleInputBlur };
};

export const DateInput = ({
  onChange,
  value,
  format = 'DD/MM/YYYY',
  ...props
}: Omit<ComponentProps<typeof Input>, 'onChange'> & {
  onChange: (date: Date | null) => void;
  format?: string;
  value?: Date | null;
}) => {
  const t = useDatePickerInputManagement({
    dateFormat: format,
    onChange,
  });

  return (
    <Input
      onBlur={(e) => t.handleInputBlur(e.target.value)}
      onChange={t.handleInputChange}
      value={value ? dayjs(value).format(format) : t.inputValue}
      placeholder={format}
      {...props}
    />
  );
};
