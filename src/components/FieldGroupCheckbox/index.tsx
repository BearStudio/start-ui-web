import React, { useEffect, useState } from 'react';

import { Checkbox, CheckboxGroup, HStack } from '@chakra-ui/react';
import { useField } from '@formiz/core';

import { FormGroup } from '../FormGroup';

export const FieldGroupCheckbox = (props) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    resetKey,
    setValue,
    value,
  } = useField(props);
  const { children, label, options = [], helper, ...otherProps } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    label,
    showError,
    ...otherProps,
  };

  const onCheck = (event) => {
    setValue(event);
  };

  return (
    <FormGroup {...formGroupProps}>
      <CheckboxGroup value={value || []} onChange={onCheck}>
        <HStack>
          {(options || []).map((item) => (
            <Checkbox value={item.value}>{item.label || item.value}</Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
      {children}
    </FormGroup>
  );
};
