import type { Meta } from '@storybook/react-vite';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { onSubmit } from '@/components/form/docs.utils';
import { Calendar } from '@/components/ui/calendar';
import { DateInput } from '@/components/ui/date-input';
import { InputGroupButton } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'DateInput',
  parameters: {
    docs: {
      description: {
        component:
          'If you are looking at a date input with picker, take a look at the DatePicker component, designed for user to select a date. This component is here to handle auto-format of a date from an input.',
      },
    },
  },
} satisfies Meta<typeof DateInput>;

export const Default = () => {
  return <DateInput onChange={onSubmit} />;
};

export const ExternalState = () => {
  const [date, setDate] = useState<Date | null>(null);

  return <DateInput onChange={(date) => setDate(date)} value={date} />;
};

export const WithPicker = () => {
  const [date, setDate] = useState<Date | null>(null);
  const datePicker = useDisclosure();

  return (
    <DateInput
      onChange={(date) => setDate(date)}
      value={date}
      endAddon={
        <Popover
          open={datePicker.isOpen}
          onOpenChange={(open) => datePicker.toggle(open)}
        >
          <PopoverTrigger render={<InputGroupButton size="icon-xs" />}>
            <CalendarIcon />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(date) => {
                setDate(date ?? null);
                datePicker.close();
              }}
              defaultMonth={date ?? undefined}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      }
    />
  );
};
