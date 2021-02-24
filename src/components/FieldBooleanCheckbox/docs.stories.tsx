import { Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldBooleanCheckbox } from './index';

export default {
  title: 'Fields/FieldBooleanCheckbox',
};
export const Default = () => {
  return (
    <Formiz>
      <Stack spacing="4">
        <FieldBooleanCheckbox
          name="FieldBooleanCheckbox"
          label="Label"
          optionLabel="Option label"
          helper="Helper"
        />
        <FieldBooleanCheckbox
          name="FieldBooleanCheckbox2"
          label="Label"
          helper="Helper"
        />
      </Stack>
    </Formiz>
  );
};
