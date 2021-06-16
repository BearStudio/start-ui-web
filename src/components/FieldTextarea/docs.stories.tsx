import React from 'react';

import { Stack, Button } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldTextarea } from './index';

export default {
  title: 'Fields/FieldTextarea',
};

export const Default = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldTextarea
        name="demo-description"
        label="Description"
        placeholder="Placeholder"
        helper="Please give a description to your project"
        required="Description is required"
      />
      <FieldTextarea
        name="demo-read-only"
        label="Read Only"
        defaultValue="Value"
        placeholder="Placeholder"
        helper="This is an helper"
        isReadOnly
      />
      <FieldTextarea
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

export const TextareaProps = () => (
  <Formiz onSubmit={console.log} autoForm>
    <Stack spacing={6}>
      <FieldTextarea
        name="demo-description"
        label="Resize is horizontal"
        placeholder="Placeholder"
        helper="Please give a description to your project"
        required="Description is required"
        textareaProps={{
          resize: 'horizontal',
        }}
      />
      <FieldTextarea
        name="demo-description"
        label="Resize is none"
        placeholder="Placeholder"
        helper="Please give a description to your project"
        textareaProps={{
          resize: 'none',
        }}
      />
      <Button type="submit">Submit</Button>
    </Stack>
  </Formiz>
);
