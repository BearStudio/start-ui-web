import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldTextarea } from './index';

export default {
  title: 'Fields/FieldTextarea',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
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
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const TextareaProps = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
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
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
