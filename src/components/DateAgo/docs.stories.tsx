import React from 'react';

import { Stack } from '@chakra-ui/react';
import dayjs from 'dayjs';

import { DateAgo } from './index';

export default {
  title: 'Components/DateAgo',
};

export const Default = () => (
  <Stack direction="row">
    <DateAgo date={Date().toString()} />
    <DateAgo date={new Date()} />
    <DateAgo date={dayjs()} />
  </Stack>
);
