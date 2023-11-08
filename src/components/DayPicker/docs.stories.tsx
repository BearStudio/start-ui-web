import { useState } from 'react';

import { Stack, Text } from '@chakra-ui/react';

import { DayPicker } from './index';

export default {
  title: 'Components/DayPicker',
};

export const Default = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>();

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker
        value={selectedDay}
        onChange={setSelectedDay}
        inputProps={{ size: 'xs' }}
      />
      <DayPicker
        value={selectedDay}
        onChange={setSelectedDay}
        inputProps={{ size: 'sm' }}
      />
      <DayPicker value={selectedDay} onChange={setSelectedDay} />
    </Stack>
  );
};

export const WithDefaultValue = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker value={selectedDay} onChange={setSelectedDay} />
    </Stack>
  );
};

export const AutoFocus = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker value={selectedDay} onChange={setSelectedDay} autoFocus />
    </Stack>
  );
};

export const IsDisabled = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker value={selectedDay} onChange={setSelectedDay} isDisabled />
    </Stack>
  );
};

export const WithPastDaysDisabled = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker
        value={selectedDay}
        onChange={setSelectedDay}
        arePastDaysDisabled
      />
    </Stack>
  );
};

export const WithoutPortal = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  return (
    <Stack spacing={2}>
      <Text>Date : {JSON.stringify(selectedDay)}</Text>
      <DayPicker
        value={selectedDay}
        onChange={setSelectedDay}
        usePortal={false}
      />
    </Stack>
  );
};
