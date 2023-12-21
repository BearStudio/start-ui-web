import { Textarea, TextareaProps } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = TextareaProps['value'];

export type FieldTextareaProps<FormattedValue = Value> = FieldProps<
  Value,
  FormattedValue
> &
  FormGroupProps & {
    componentProps?: TextareaProps;
  };

export const FieldTextarea = <FormattedValue = Value,>(
  props: FieldTextareaProps<FormattedValue>
) => {
  const field = useField(props);

  const { componentProps, children, ...rest } = field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  } satisfies FormGroupProps;

  return (
    <FormGroup {...formGroupProps}>
      <Textarea
        {...componentProps}
        id={field.id}
        value={field.value ?? ''}
        onChange={(e) => field.setValue(e.target.value)}
        onFocus={() => field.setIsTouched(false)}
        onBlur={() => field.setIsTouched(true)}
      />
      {children}
    </FormGroup>
  );
};
