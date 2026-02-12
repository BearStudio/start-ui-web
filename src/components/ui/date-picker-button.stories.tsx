import dayjs from 'dayjs';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDisclosure } from 'react-use-disclosure';
import { isNullish } from 'remeda';

import { Calendar } from '@/components/ui/calendar';
import { DatePickerButton } from '@/components/ui/date-picker-button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'DatePickerButton',
};

export const Default = () => {
  return <DatePickerButton />;
};

export const NoValueString = () => {
  return (
    <DatePickerButton className="text-muted-foreground">
      <span>Please select a date</span>
    </DatePickerButton>
  );
};

export const Value = () => {
  return <DatePickerButton>{dayjs().format('DD/MM/YYYY')}</DatePickerButton>;
};

export const UsageWithPopover = () => {
  const [date, setDate] = useState<Date>();
  const datePicker = useDisclosure();

  return (
    <Popover
      open={datePicker.isOpen}
      onOpenChange={(open) => datePicker.toggle(open)}
    >
      <PopoverTrigger render={<DatePickerButton />}>
        {date ? dayjs(date).format('DD/MM/YYYY') : null}
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

export const UsageWithPopoverRange = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const format = () => {
    if (isNullish(date?.from)) {
      return null;
    }

    if (isNullish(date?.to)) {
      return dayjs(date.from).format('DD/MM/YYYY');
    }

    return `${dayjs(date.from).format(
      'DD/MM/YYYY'
    )} - ${dayjs(date.to).format('DD/MM/YYYY')}`;
  };

  return (
    <Popover>
      <PopoverTrigger render={<DatePickerButton className="max-w-75" />}>
        {format()}
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
  );
};

export const UsageWithDialog = () => {
  const [date, setDate] = useState<Date>();
  const datePicker = useDisclosure();

  return (
    <Dialog
      open={datePicker.isOpen}
      onOpenChange={(open) => datePicker.toggle(open)}
    >
      <DialogTrigger render={<DatePickerButton />}>
        {date ? dayjs(date).format('DD/MM/YYYY') : null}
      </DialogTrigger>
      <DialogContent className="w-auto" hideCloseButton>
        <DialogBody>
          <Calendar
            autoFocus
            mode="single"
            className="p-0"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              datePicker.close();
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
