import { useState } from 'react';

import { Box, Kbd, Stack, Text, chakra } from '@chakra-ui/react';
import { Meta } from '@storybook/react';
import dayjs from 'dayjs';

import {
  DateSelector,
  DateSelectorNextDayButton,
  DateSelectorPicker,
  DateSelectorPreviousDayButton,
} from '.';

export default {
  title: 'Components/DateSelector',
  decorators: [
    (Story) => {
      return (
        <Box minH={'20rem'}>
          <Story />
        </Box>
      );
    },
  ],
} satisfies Meta;

export const Default = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  return (
    <Stack spacing="8">
      <DateSelector date={selectedDate} onChange={setSelectedDate}>
        <DateSelectorPreviousDayButton aria-label="Previous day" />
        <DateSelectorPicker />
        <DateSelectorNextDayButton aria-label="Next day" />
      </DateSelector>

      <Text>
        You can use the <Kbd>ArrowLeft</Kbd> to go to the previous day, and the{' '}
        <Kbd>ArrowRight</Kbd> to go to the next day.
      </Text>
    </Stack>
  );
};

export const DateRendering = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  return (
    <DateSelector date={selectedDate} onChange={setSelectedDate}>
      <DateSelectorPreviousDayButton aria-label="Previous day" />
      <DateSelectorPicker>
        {({ date, onOpen }) => (
          <chakra.button onClick={onOpen} px="4">
            <Text
              fontSize="sm"
              textTransform="capitalize"
              color="gray.800"
              _dark={{ color: 'gray.100' }}
              fontWeight="bold"
            >
              {date.format('DD MMM YYYY')}
            </Text>
            <Text
              fontSize="xs"
              textTransform="capitalize"
              color="gray.600"
              _dark={{ color: 'gray.300' }}
            >
              {date.format(`dddd`)}
            </Text>
          </chakra.button>
        )}
      </DateSelectorPicker>
      <DateSelectorNextDayButton aria-label="Next day" />
    </DateSelector>
  );
};
