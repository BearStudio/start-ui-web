import React, { useEffect, useState } from 'react';

import { Checkbox, CheckboxGroup, HStack } from '@chakra-ui/react';
import { useField } from '@formiz/core';

import { FormGroup } from '@/components/FormGroup';

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
    const changedValue = event.target.value;
    if (value?.includes(changedValue)) {
      setValue(value?.filter((item) => item !== changedValue));
    } else {
      setValue(value?.concat(changedValue) || [changedValue]);
    }
  };

  return (
    <FormGroup {...formGroupProps}>
      <CheckboxGroup value={value || []}>
        <HStack>
          {(options || []).map((item) => (
            <Checkbox value={item.value} onChange={onCheck}>
              {item.label || item.value}
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
      {children}
    </FormGroup>
  );
};
