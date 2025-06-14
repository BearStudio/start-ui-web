import type { Meta } from '@storybook/react-vite';
import dayjs from 'dayjs';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';

export default {
  title: 'Calendar',
  parameters: {
    docs: {
      description: {
        component:
          'Calendar component uses [React Day Picker](https://daypicker.dev/) behind the scene. Most of its implementation is inspired by [shadcn and Luca Ziegler Félix](https://date-picker.luca-felix.com/).',
      },
    },
  },
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

export const WithStartAndEndMonths = () => {
  return (
    <Calendar
      startMonth={dayjs().startOf('year').subtract(2, 'months').toDate()}
      endMonth={dayjs().endOf('year').add(2, 'months').toDate()}
    />
  );
};

export const MultipleMonths = () => {
  return <Calendar numberOfMonths={3} />;
};

export const Dropdowns = () => {
  return <Calendar captionLayout="dropdown" />;
};

export const DisabledSelected = () => {
  const date = dayjs().set('date', 8).toDate();

  return <Calendar mode="single" selected={date} disabled={date} />;
};
