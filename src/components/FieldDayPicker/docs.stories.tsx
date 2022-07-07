import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldDayPicker } from './index';

export default {
  title: 'Fields/FieldDayPicker',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={4}>
      <FieldDayPicker
        name="demo"
        label="Date"
        placeholder="Select a date..."
        helper="This is an helper"
        required="Date is required"
      />
      <Box>
        <Button type="submit">Submit</Button>
      </Box>
    </Stack>
  </Formiz>
);
