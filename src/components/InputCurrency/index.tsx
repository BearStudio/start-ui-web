import React, { useEffect, useRef, useState } from 'react';

import { forwardRef, InputProps, Input } from '@chakra-ui/react';
import CurrencyInput from 'react-currency-input-field';
import { useTranslation } from 'react-i18next';

interface InputCurrencyProps extends Omit<InputProps, 'onChange'> {
  value: number;
  locale?: string;
  currency?: string;
  decimals?: number;
  groupSpace?: number;
  onChange?(value: number): void;
}
export const InputCurrency = forwardRef<InputCurrencyProps, 'input'>(
  (
    {
      value,
      locale,
      currency = 'EUR',
      decimals = 2,
      groupSpace = 2,
      onChange,
      ...rest
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const [internalValue, setInternalValue] = useState(String(value ?? ''));
    const internalValueRef = useRef(internalValue);
    internalValueRef.current = internalValue;
    useEffect(() => {
      if (String(value) !== internalValueRef.current) {
        setInternalValue(String(value ?? ''));
      }
    }, [value]);

    return (
      <Input
        as={CurrencyInput}
        ref={ref}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        intlConfig={{ locale: locale || i18n.language, currency }}
        decimalScale={decimals}
        value={internalValue}
        onValueChange={(val: string) => {
          setInternalValue(val);
          if (onChange) {
            onChange(val ? Number(val?.replace(',', '.')) : null);
          }
        }}
        {...rest}
      />
    );
  }
);
