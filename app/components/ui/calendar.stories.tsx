import type { Meta } from '@storybook/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';

export default {
  title: 'Calendar',
} satisfies Meta<typeof Calendar>;

export const Default = () => {
  return <Calendar />;
};

export const Controlled = () => {
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
