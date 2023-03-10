import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldBooleanCheckbox } from './index';

export default {
  title: 'Fields/FieldBooleanCheckbox',
};
export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldBooleanCheckbox
          name="FieldBooleanCheckbox"
          label="Label"
          optionLabel="Option label"
          helper="Helper"
          required="Required"
        />
        <FieldBooleanCheckbox
          name="FieldBooleanCheckbox2"
          label="Label"
          helper="Helper"
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
