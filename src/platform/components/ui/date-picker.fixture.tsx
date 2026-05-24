import { useState } from 'react';

import { Button } from '@/platform/components/ui/button';
import { DatePicker } from '@/platform/components/ui/date-picker';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/platform/components/ui/dialog';
const Default = () => {
  const [date, setDate] = useState<Date | null>();

  return <DatePicker onChange={(value) => setDate(value)} value={date} />;
};

const CalendarCustomization = () => {
  const [date, setDate] = useState<Date | null>();

  return (
    <DatePicker
      onChange={(value) => setDate(value)}
      value={date}
      calendarProps={{
        startMonth: new Date(),
        endMonth: new Date(),
      }}
    />
  );
};

const NoCalendar = () => {
  const [date, setDate] = useState<Date | null>();

  return (
    <DatePicker onChange={(value) => setDate(value)} value={date} noCalendar />
  );
};

const InDialog = () => {
  const [date, setDate] = useState<Date | null>();

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>
        Open
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Birthday</DialogTitle>
          <DialogDescription>Choose a date</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DatePicker onChange={(value) => setDate(value)} value={date} />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button />}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default {
  Default,
  CalendarCustomization,
  NoCalendar,
  InDialog,
};
