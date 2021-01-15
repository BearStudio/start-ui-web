import React from 'react';

import { Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldInput } from './index';

export default {
  title: 'Fields/FieldInput',
};

export const Default = () => (
  <Formiz>
    <Stack spacing={6}>
      <FieldInput
        name="username"
        label="Username"
        placeholder="Placeholder"
        helper="This is an helper"
        required="Username is required"
      />
      <FieldInput
        name="password"
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
    </Stack>
  </Formiz>
);
