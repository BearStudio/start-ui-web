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
        {/* 1 */}
        <FieldInput
          name="demo-password"
          label="Password"
          helper="This is an helper"
          required="Password is required"
          placeholder="Placeholder"
          type="password"
        />
        {/* 2 */}
        <FieldInput
          name="demo-username"
          label="Username"
          helper="This is an helper"
          required="Username is required"
          placeholder="Placeholder"
        />
        {/* 3 */}
        <FieldInput
          name="demo-read-only"
          label="Read Only"
          defaultValue="Value"
          helper="This is an helper"
          isReadOnly
          placeholder="Placeholder"
        />
        <FieldInput
          name="demo-disabled"
          label="Disabled"
          defaultValue="Value"
          helper="This is an helper"
          isDisabled
          placeholder="Placeholder"
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
