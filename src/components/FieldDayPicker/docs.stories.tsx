import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { Meta } from '@storybook/react';

import { FieldDayPicker } from './index';

export default {
  title: 'Fields/FieldDayPicker',
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
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
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
};
