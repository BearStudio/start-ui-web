import React from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import { isRequired } from '@formiz/validations';

import { FieldHidden } from '.';

export default {
  title: 'Fields/FieldHidden',
};

export const Default = () => (
  <Formiz autoForm>
    <Stack spacing={4}>
      <FieldHidden
        name="error"
        validations={[{ rule: isRequired(), message: 'Field required' }]}
      />
      <Box>
        <Button type="submit">Submit</Button>
      </Box>
    </Stack>
  </Formiz>
);
