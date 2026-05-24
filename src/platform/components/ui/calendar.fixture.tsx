import dayjs from 'dayjs';
import { useState } from 'react';

import { Calendar } from '@/platform/components/ui/calendar';
const Default = () => {
  return <Calendar />;
};

const Controlled = () => {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(date) => {
        if (date) {
          setSelected(date);
        }
      }}
      footer={
        <div className="mt-4 text-sm">
          {selected
            ? `Selected: ${dayjs(selected).format('DD/MM/YYYY')}`
            : 'Pick a day'}
        </div>
      }
    />
  );
};

const WithStartAndEndMonths = () => {
  return (
    <Calendar
      startMonth={dayjs().startOf('year').subtract(2, 'months').toDate()}
      endMonth={dayjs().endOf('year').add(2, 'months').toDate()}
    />
  );
};

const MultipleMonths = () => {
  return <Calendar numberOfMonths={3} />;
};

const Dropdowns = () => {
  return <Calendar captionLayout="dropdown" />;
};

const DisabledSelected = () => {
  const date = dayjs().set('date', 8).toDate();

  return <Calendar mode="single" selected={date} disabled={date} />;
};

export default {
  Default,
  Controlled,
  WithStartAndEndMonths,
  MultipleMonths,
  Dropdowns,
  DisabledSelected,
};
