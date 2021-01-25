import { Formiz } from '@formiz/core';

import { FieldGroupCheckbox } from './index';

export default {
  title: 'components/FieldGroupCheckbox',
};
export const Default = () => {
  const options = [{ value: 'One' }, { value: 'Two' }, { value: 'Three' }];
  return (
    <Formiz>
      <FieldGroupCheckbox
        name="FieldGroupCheckbox"
        label="Label"
        helper="Helper"
        options={options}
      />
    </Formiz>
  );
};
