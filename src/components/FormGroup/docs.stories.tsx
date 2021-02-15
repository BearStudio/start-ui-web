import React from 'react';

import { FormGroup } from './index';

export default {
  title: 'Components/FormGroup',
};

export const Default = () => (
  <FormGroup label="Label" helper="Helper" isRequired>
    -- input here --
  </FormGroup>
);

export const Error = () => (
  <FormGroup
    label="Label"
    helper="Helper"
    errorMessage="Error message"
    showError
  >
    -- input here --
  </FormGroup>
);
