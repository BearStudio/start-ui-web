import React, { useEffect, useState } from 'react';

import { InputGroup, InputRightElement, Spinner } from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { InputCurrency, InputCurrencyProps } from '@/components/InputCurrency';

export interface FieldCurrencyProps
  extends Omit<FieldProps, 'value'>,
    Omit<FormGroupProps, 'placeholder'>,
    Pick<
      InputCurrencyProps,
      'currency' | 'locale' | 'decimals' | 'placeholder'
    > {
  size?: 'sm' | 'md' | 'lg';
  value?: number;
}

export const FieldCurrency = (props: FieldCurrencyProps) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isValidating,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);
  const {
    children,
    label,
    placeholder,
    helper,
    size = 'md',
    currency,
    locale,
    decimals,
    ...rest
  } = otherProps;
  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && (isTouched || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <InputGroup size={size}>
        <InputCurrency
          id={id}
          value={value ?? null}
          onChange={setValue}
          onBlur={() => setIsTouched(true)}
          placeholder={placeholder}
          currency={currency}
          locale={locale}
          decimals={decimals}
        />
        {(isTouched || isSubmitted) && isValidating && (
          <InputRightElement>
            <Spinner size="sm" flex="none" />
          </InputRightElement>
        )}
      </InputGroup>
      {children}
    </FormGroup>
  );
};
