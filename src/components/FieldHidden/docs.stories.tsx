import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isRequired } from '@formiz/validations';

import { FieldHidden } from '.';

export default {
  title: 'Fields/FieldHidden',
};

export const Default = () => {
  const form = useForm({ onSubmit: console.log });
  return (
    <Formiz connect={form} autoForm>
      <Stack spacing={4}>
        <FieldHidden
          name="error"
          validations={[{ handler: isRequired(), message: 'Field required' }]}
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
