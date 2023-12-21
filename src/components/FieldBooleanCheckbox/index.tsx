import React from 'react';

import { Checkbox, CheckboxProps } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = boolean;

export type FieldBooleanCheckboxProps<FormattedValue = Value> = FieldProps<
  Value,
  FormattedValue
> &
  FormGroupProps & {
    checkboxProps?: CheckboxProps;
    optionLabel?: string;
  };

export const FieldBooleanCheckbox = <FormattedValue = Value,>(
  props: FieldBooleanCheckboxProps<FormattedValue>
) => {
  const field = useField(props);
  const { children, checkboxProps, optionLabel, ...rest } = field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Checkbox
        {...checkboxProps}
        id={field.id}
        isChecked={field.value ?? undefined}
        onChange={() => field.setValue(!field.value)}
      >
        {optionLabel ?? <>&nbsp;</>}
      </Checkbox>
      {children}
    </FormGroup>
  );
};
