import { useState } from 'react';

import { DayPicker } from './index';

export default {
  title: 'components/Daypicker',
};
export const Default = () => {
  const [day, setDay] = useState(new Date());
  return (
    <DayPicker
      value={day}
      onChange={(day) => {
        setDay(day);
      }}
    />
  );
};
