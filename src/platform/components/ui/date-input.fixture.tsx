import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useDisclosure } from 'react-use-disclosure';

import { onSubmit } from '@/platform/components/form/docs.utils';
import { Calendar } from '@/platform/components/ui/calendar';
import { DateInput } from '@/platform/components/ui/date-input';
import { InputGroupButton } from '@/platform/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/platform/components/ui/popover';
const Default = () => {
  return <DateInput onChange={onSubmit} />;
};

const ExternalState = () => {
  const [date, setDate] = useState<Date | null>(null);

  return <DateInput onChange={(date) => setDate(date)} value={date} />;
};

const WithPicker = () => {
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

export default {
  Default,
  ExternalState,
  WithPicker,
};
