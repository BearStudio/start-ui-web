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
          helper="This is an helper"
          required="Color is required"
          options={colors}
          placeholder="Placeholder"
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
          helper="This is an helper"
          options={colors}
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

export const DefaultValue = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          helper="This is an helper"
          required="Color is required"
          defaultValue={colors[0]?.value}
          options={colors}
          isClearable
          placeholder="Placeholder"
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const OptionsColorScheme = () => {
  const form = useForm<{ colors: string }>({ onSubmit: console.log });

  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          helper="This is an helper"
          required="Color is required"
          options={colors}
          isClearable
          placeholder="Placeholder"
          selectProps={{
            selectedOptionColorScheme: 'red',
          }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const CreateableMultiSelect = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          helper="This is an helper"
          required="Color is required"
          options={colors}
          isMulti
          placeholder="Placeholder"
          selectProps={{
            type: 'creatable',
          }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const DefaultValueCreateableMultiSelect = () => {
  const form = useForm({
    onSubmit: console.log,
  });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          helper="This is an helper"
          required="Color is required"
          options={colors}
          isMulti
          defaultValue={['red', 'blue']}
          placeholder="Placeholder"
          selectProps={{
            type: 'creatable',
          }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const InitialValuesCreateableMultiSelect = () => {
  const form = useForm({
    onSubmit: console.log,
    initialValues: { colors: ['red', 'blue'] },
  });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldSelect
          name="colors"
          label="Colors"
          helper="This is an helper"
          required="Color is required"
          options={colors}
          isMulti
          placeholder="Placeholder"
          selectProps={{
            type: 'creatable',
          }}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
