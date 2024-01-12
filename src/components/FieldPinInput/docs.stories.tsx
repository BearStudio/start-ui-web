import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldPinInput } from '.';

export default {
  title: 'Fields/FieldPinInput',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });

  return (
    <Formiz connect={form} autoForm>
      <Stack>
        <FieldPinInput label="Code" name="code" />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};

export const OnComplete = () => {
  const form = useForm({ onSubmit: console.log });

  return (
    <Formiz connect={form} autoForm>
      <Stack>
        <FieldPinInput
          label="Code"
          name="code"
          helper="Completely fill the input, it will automatically submit the form"
          pinInputProps={{ onComplete: () => form.submit() }}
        />
      </Stack>
    </Formiz>
  );
};
