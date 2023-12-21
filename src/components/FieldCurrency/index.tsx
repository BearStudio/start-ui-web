import React from 'react';

import { InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { InputCurrency, InputCurrencyProps } from '@/components/InputCurrency';

type UsualInputCurrencyProps = 'placeholder';

export type FieldCurrencyProps<FormattedValue = number> = FieldProps<
  number,
  FormattedValue
> &
  FormGroupProps &
  Pick<InputCurrencyProps, UsualInputCurrencyProps> & {
    inputCurrencyProps?: Omit<InputCurrencyProps, UsualInputCurrencyProps>;
  };

export const FieldCurrency = <FormattedValue = number,>(
  props: FieldCurrencyProps<FormattedValue>
) => {
  const field = useField(props);

  const { inputCurrencyProps, children, placeholder, ...rest } =
    field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  } satisfies FormGroupProps;

  return (
    <FormGroup {...formGroupProps}>
      <InputGroup size={inputCurrencyProps?.size}>
        <InputCurrency
          id={field.id}
          value={field.value ?? undefined}
          onChange={(newValue) => field.setValue(newValue ?? null)}
          onFocus={() => field.setIsTouched(false)}
          onBlur={() => field.setIsTouched(true)}
          placeholder={placeholder}
          {...inputCurrencyProps}
        />
        {(field.isTouched || field.isSubmitted) && field.isValidating && (
          <InputRightElement>
            <Spinner size="sm" flex="none" />
          </InputRightElement>
        )}
      </InputGroup>
      {children}
    </FormGroup>
  );
};
