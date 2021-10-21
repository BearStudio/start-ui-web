import { useState } from 'react';

import { DayPicker } from './index';

export default {
  title: 'Components/DayPicker',
};
export const Default = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null | undefined>(
    new Date()
  );
  return (
    <>
      <DayPicker
        value={selectedDay}
        onChange={(day) => {
          setSelectedDay(day);
        }}
      />
      {JSON.stringify(selectedDay)}
    </>
  );
};
