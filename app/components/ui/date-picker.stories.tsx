import { useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';

export default {
  title: 'DatePicker',
};

export const Default = () => {
  const [date, setDate] = useState<Date | null>();

  return <DatePicker onChange={(value) => setDate(value)} value={date} />;
};

export const CalendarCustomization = () => {
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
