import { useState } from 'react';

import {
  addMonthsToDate,
  endOfTodayYearDate,
  formatDate,
  startOfTodayYearDate,
  withDayOfMonth,
} from '@/platform/lib/temporal/date-time';

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
          {selected ? `Selected: ${formatDate(selected)}` : 'Pick a day'}
        </div>
      }
    />
  );
};

const WithStartAndEndMonths = () => {
  return (
    <Calendar
      startMonth={addMonthsToDate(startOfTodayYearDate(), -2)}
      endMonth={addMonthsToDate(endOfTodayYearDate(), 2)}
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
  const date = withDayOfMonth(new Date(), 8);

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
