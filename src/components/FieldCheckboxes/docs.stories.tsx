import { Formiz } from '@formiz/core';

import { FieldCheckboxes } from './index';

export default {
  title: 'Fields/FieldCheckboxes',
};
export const Default = () => {
  const options = [{ value: 'One' }, { value: 'Two' }, { value: 'Three' }];
  return (
    <Formiz>
      <FieldCheckboxes
        name="FieldCheckboxes"
        label="Label"
        helper="Helper"
        options={options}
      />
    </Formiz>
  );
};
