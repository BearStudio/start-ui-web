import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldInput } from './index';

export default {
  title: 'Fields/FieldInput',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldInput
          name="demo-username"
          label="Username"
          placeholder="Placeholder"
          helper="This is an helper"
          required="Username is required"
        />
        <FieldInput
          name="demo-password"
          type="password"
          label="Password"
          placeholder="Placeholder"
          helper="This is an helper"
          required="Password is required"
        />
        <FieldInput
          name="demo-read-only"
          label="Read Only"
          defaultValue="Value"
          placeholder="Placeholder"
          helper="This is an helper"
          isReadOnly
        />
        <FieldInput
          name="demo-disabled"
          label="Disabled"
          defaultValue="Value"
          placeholder="Placeholder"
          helper="This is an helper"
          isDisabled
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
