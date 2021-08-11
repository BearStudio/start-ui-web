import React from 'react';

import { Button, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';
import { isRequired } from '@formiz/validations';

import { FieldHidden } from '.';

export default {
  title: 'Fields/FieldHidden',
};

export const Default = () => (
  <Formiz>
    <Stack spacing={6}>
      <FieldHidden
        name="error"
        validations={[{ rule: isRequired(), message: 'Field required' }]}
      />
      <Button type="submit" />
    </Stack>
  </Formiz>
);
