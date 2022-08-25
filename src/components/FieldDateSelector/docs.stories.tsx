import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import dayjs from 'dayjs';

import { FieldDateSelector } from './index';

export default {
  title: 'Fields/FieldDateSelector',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={4}>
      <FieldDateSelector
        name="demo"
        label="Date"
        helper="This is an helper"
        required="Date is required"
        defaultValue={dayjs()}
      />
      <Box>
        <Button type="submit">Submit</Button>
      </Box>
    </Stack>
  </Formiz>
);
