import { useState } from 'react';

import { Box } from '@chakra-ui/react';

import { DayPicker } from './index';

export default {
  title: 'Components/DayPicker',
  decorators: [
    (Story: TODO) => {
      return (
        <Box minH={'20rem'}>
          <Story />
        </Box>
      );
    },
  ],
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
