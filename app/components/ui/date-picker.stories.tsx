import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { DateRange } from 'react-day-picker';
import { useDisclosure } from 'react-use-disclosure';
import { isNullish } from 'remeda';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'DatePicker',
};

export const Default = () => {
  const [date, setDate] = React.useState<Date>();
  const datePicker = useDisclosure();

  return (
    <Popover
      open={datePicker.isOpen}
      onOpenChange={(open) => datePicker.toggle(open)}
    >
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon />
          {date ? dayjs(date).format('DD/MM/YYYY') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            setDate(date);
            datePicker.close();
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export const Range = () => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: dayjs().toDate(),
    to: dayjs().add(20, 'days').toDate(),
  });

  const format = () => {
    if (isNullish(date?.from)) {
      return <span>Pick a date</span>;
    }

    if (isNullish(date?.to)) {
      return dayjs(date.from).format('DD/MM/YYYY');
    }

    return `${dayjs(date.from).format(
      'DD/MM/YYYY'
    )} - ${dayjs(date.to).format('DD/MM/YYYY')}`;
  };

  return (
    <div className={cn('grid gap-2')}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="secondary"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {format()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
