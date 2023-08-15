import React from 'react';

import { NumericStepperInput } from './index';

export default {
  title: 'Components/NumericStepperInput',
};

export const Default = () => {
  return <NumericStepperInput rightElement="%" width="200px" min={0} max={5} />;
};

export const Disabled = () => {
  return <NumericStepperInput rightElement="W" width="200px" isDisabled />;
};

export const VariantOutlined = () => {
  return (
    <NumericStepperInput
      variant="outlined"
      rightElement="%"
      width="200px"
      min={0}
      max={5}
    />
  );
};
