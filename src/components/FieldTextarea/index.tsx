import { Textarea, TextareaProps } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Value = TextareaProps['value'];

type UsualTextareaProps = 'placeholder';

export type FieldTextareaProps<FormattedValue = Value> = FieldProps<
  Value,
  FormattedValue
> &
  FormGroupProps &
  Pick<TextareaProps, UsualTextareaProps> & {
    textAreaProps?: Omit<TextareaProps, UsualTextareaProps>;
  };

export const FieldTextarea = <FormattedValue = Value,>(
  props: FieldTextareaProps<FormattedValue>
) => {
  const field = useField(props);

  const { textAreaProps, children, placeholder, ...rest } = field.otherProps;

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
        {...textAreaProps}
        placeholder={placeholder}
        id={field.id}
        value={field.value ?? ''}
        onChange={(e) => {
          field.setValue(e.target.value);
          textAreaProps?.onChange?.(e);
        }}
        onFocus={(e) => {
          field.setIsTouched(false);
          textAreaProps?.onFocus?.(e);
        }}
        onBlur={(e) => {
          field.setIsTouched(true);
          textAreaProps?.onBlur?.(e);
        }}
      />
      {children}
    </FormGroup>
  );
};
