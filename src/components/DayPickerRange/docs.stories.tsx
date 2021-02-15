import React from 'react';

import { Box } from '@chakra-ui/react';
import dayjs from 'dayjs';

import { DayPickerRange } from '.';

export default {
  title: 'components/DayPickerRange',
};

export const Default = () => {
  return (
    <Box h="400px">
      <DayPickerRange
        fromDayPickerProps={{
          defaultValue: dayjs('05/24/2021').toDate(),
        }}
        toDayPickerProps={{
          defaultValue: dayjs('05/30/2021').toDate(),
        }}
      />
    </Box>
  );
};

export const DayPickerRangeWithCommonAndSpecificProps = () => {
  return (
    <DayPickerRange
      fromDayPickerProps={{
        dayPickerProps: {
          disabledDays: { daysOfWeek: [0, 1, 2] },
          numberOfMonths: 1,
        },
      }}
      toDayPickerProps={{
        dayPickerProps: {
          disabledDays: { daysOfWeek: [3, 4, 5, 6] },
          numberOfMonths: 2,
        },
      }}
    />
  );
};

export const DisabledDayPickerRange = () => (
  <DayPickerRange isDisabled placeholder="Disabled DayPicker" />
);
