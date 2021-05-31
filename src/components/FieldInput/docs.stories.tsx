import React from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldInput } from './index';

export default {
  title: 'Fields/FieldInput',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
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
      <Button type="submit">Submit</Button>
    </Stack>
  </Formiz>
);
