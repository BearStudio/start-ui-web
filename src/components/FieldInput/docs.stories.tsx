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
          helper="This is an helper"
          required="Username is required"
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <FieldInput
          name="demo-password"
          label="Password"
          helper="This is an helper"
          required="Password is required"
          componentProps={{ type: 'password', placeholder: 'Placeholder' }}
        />
        <FieldInput
          name="demo-read-only"
          label="Read Only"
          defaultValue="Value"
          helper="This is an helper"
          isReadOnly
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <FieldInput
          name="demo-disabled"
          label="Disabled"
          defaultValue="Value"
          helper="This is an helper"
          isDisabled
          componentProps={{ placeholder: 'Placeholder' }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
