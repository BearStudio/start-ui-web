import { Box, Button, Stack } from '@chakra-ui/react';
import { Formiz } from '@formiz/core';

import { FieldRadios } from './index';

export default {
  title: 'Fields/FieldRadios',
};
export const Default = () => {
  const options = [
    { label: 'Red', value: 'red' },
    { label: 'Green', value: 'green' },
    { label: 'Blue', value: 'blue' },
  ];

  return (
    <Formiz autoForm>
      <Stack spacing={4}>
        <FieldRadios
          name="FieldRadios"
          label="Label"
          helper="Helper"
          options={options}
          required="Required"
        />
        <Box>
          <Button type="submit">Submit</Button>
        </Box>
      </Stack>
    </Formiz>
  );
};
