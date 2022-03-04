import { Code } from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { FieldMultiSelect } from '.';

export default {
  title: 'Fields/FieldMultiSelect',
};
export const Default = () => {
  const form = useForm({ subscribe: true });

  const options = [
    { label: 'One', value: 'One' },
    { label: 'Two', value: 'Two' },
    { label: 'Three', value: 'Three' },
  ];
  return (
    <Formiz autoForm connect={form}>
      <FieldMultiSelect
        name="mySelect"
        label="Label"
        helper="Helper"
        options={options}
      />

      <Code mt={5}>{JSON.stringify(form.values, null, 2)}</Code>
    </Formiz>
  );
};
