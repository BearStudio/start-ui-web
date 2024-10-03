import React, { useState } from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';

import { MonthPicker } from '.';

export default {
  title: 'components/MonthPicker',
};

export const Default = () => <MonthPicker />;

export const Wrapper = () => (
  <Box p={4} boxShadow="lg" w="20rem">
    <MonthPicker />
  </Box>
);

export const InitialYear = () => <MonthPicker year={1994} />;

export const UpdateYearFromOutside = () => {
  const [year, setYear] = useState(1994);
  return (
    <Stack>
      <MonthPicker year={year} onYearChange={(y) => setYear(y)} />
      <Button onClick={() => setYear((y) => y + 1)}>Increment Year</Button>
    </Stack>
  );
};

export const SelectedMonth = () => (
  <MonthPicker year={2021} selectedMonths={[new Date(2021, 7)]} />
);

export const SelectMultipleMonths = () => {
  const [selectedMonths, setSelectedMonths] = useState<Array<Date>>([]);

  const handleMonthClick = (month: Date) => {
    if (selectedMonths.find((date) => date.getTime() === month.getTime())) {
      setSelectedMonths(
        selectedMonths.filter((date) => date.getTime() !== month.getTime())
      );
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  return (
    <MonthPicker
      selectedMonths={selectedMonths}
      onMonthClick={handleMonthClick}
    />
  );
};
