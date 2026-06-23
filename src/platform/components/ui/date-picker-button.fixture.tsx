import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useDisclosure } from 'react-use-disclosure';
import { isNullish } from 'remeda';

import {
  formatCurrentDate,
  formatDate,
} from '@/platform/lib/temporal/date-time';

import { Calendar } from '@/platform/components/ui/calendar';
import { DatePickerButton } from '@/platform/components/ui/date-picker-button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTrigger,
} from '@/platform/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/platform/components/ui/popover';
const Default = () => {
  return <DatePickerButton />;
};

const NoValueString = () => {
  return (
    <DatePickerButton className="text-muted-foreground">
      <span>Please select a date</span>
    </DatePickerButton>
  );
};

const Value = () => {
  return <DatePickerButton>{formatCurrentDate()}</DatePickerButton>;
};

const UsageWithPopover = () => {
  const [date, setDate] = useState<Date>();
  const datePicker = useDisclosure();

  return (
    <Popover
      open={datePicker.isOpen}
      onOpenChange={(open) => datePicker.toggle(open)}
    >
      <PopoverTrigger render={<DatePickerButton />}>
        {formatDate(date)}
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

const UsageWithPopoverRange = () => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const format = () => {
    if (isNullish(date?.from)) {
      return null;
    }

    if (isNullish(date?.to)) {
      return formatDate(date.from);
    }

    return `${formatDate(date.from)} - ${formatDate(date.to)}`;
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

const UsageWithDialog = () => {
  const [date, setDate] = useState<Date>();
  const datePicker = useDisclosure();

  return (
    <Dialog
      open={datePicker.isOpen}
      onOpenChange={(open) => datePicker.toggle(open)}
    >
      <DialogTrigger render={<DatePickerButton />}>
        {formatDate(date)}
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

export default {
  Default,
  NoValueString,
  Value,
  UsageWithPopover,
  UsageWithPopoverRange,
  UsageWithDialog,
};
