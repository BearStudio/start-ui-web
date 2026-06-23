import type { ComponentProps } from 'react';

import { useDatePickerInputManagement } from '@/platform/components/ui/date-input-management';
import { Input } from '@/platform/components/ui/input';

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
      value={datePickerInputManagement.inputValue}
      placeholder={format}
      {...props}
    />
  );
};
