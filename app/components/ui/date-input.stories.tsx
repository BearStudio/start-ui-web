import type { Meta } from '@storybook/react';
import { useState } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { onSubmit } from '@/components/form/docs.utils';
import { Calendar } from '@/components/ui/calendar';
import { DateInput } from '@/components/ui/date-input';
import { DatePickerButton } from '@/components/ui/date-picker-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'DateInput',
} satisfies Meta<typeof DateInput>;

export const Default = () => {
  return <DateInput onChange={onSubmit} />;
};

export const WithPicker = () => {
  const [date, setDate] = useState<Date | null>(null);
  const datePicker = useDisclosure();

  return (
    <DateInput
      className="pr-1"
      placeholder="Placeholder..."
      onChange={(date) => setDate(date)}
      endElement={
        <Popover
          open={datePicker.isOpen}
          onOpenChange={(open) => datePicker.toggle(open)}
        >
          <PopoverTrigger asChild>
            <DatePickerButton />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(date) => {
                setDate(date ?? null);
                datePicker.close();
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      }
    />
  );
};
