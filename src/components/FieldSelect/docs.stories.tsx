import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldSelect } from '.';

const colors = [
  { label: 'Red', value: 'red' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Blue', value: 'blue' },
];

export default {
  title: 'Fields/FieldSelect',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          placeholder="Placeholder"
          helper="This is an helper"
          required="Color is required"
          options={colors}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const Disabled = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          placeholder="Placeholder"
          helper="This is an helper"
          options={colors}
          isDisabled
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const DefaultValue = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          placeholder="Placeholder"
          helper="This is an helper"
          required="Color is required"
          defaultValue={colors[0]?.value}
          options={colors}
          selectProps={{ isClearable: true }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
