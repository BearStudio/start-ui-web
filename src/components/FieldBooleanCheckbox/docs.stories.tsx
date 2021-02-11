import { Formiz } from '@formiz/core';

import { FieldBooleanCheckbox } from './index';

export default {
  title: 'Fields/FieldBooleanCheckbox',
};
export const Default = () => {
  return (
    <Formiz>
      <FieldBooleanCheckbox
        name="FieldBooleanCheckbox"
        label="Label"
        helper="Helper"
      />
    </Formiz>
  );
};
