import { Box, Button, Code, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldMultiSelect } from '.';

export default {
  title: 'Fields/FieldMultiSelect',
};

const options = [
  { label: 'One', value: 'One' },
  { label: 'Two', value: 'Two' },
  { label: 'Three', value: 'Three' },
];

export const Default = () => {
  const form = useForm({ subscribe: true });

  return (
    <Formiz autoForm connect={form}>
      <Stack spacing={4}>
        <FieldMultiSelect
          name="mySelect"
          label="Label"
          helper="Helper"
          options={options}
          required="Required"
        />
        <Code>{JSON.stringify(form.values, null, 2)}</Code>
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const DefaultValue = () => {
  const form = useForm({ subscribe: true });

  return (
    <Formiz autoForm connect={form}>
      <Stack spacing={4}>
        <FieldMultiSelect
          name="mySelect"
          label="Label"
          helper="Helper"
          defaultValue={options[0].value}
          options={options}
          required="Required"
        />

        <Code>{JSON.stringify(form.values, null, 2)}</Code>
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
