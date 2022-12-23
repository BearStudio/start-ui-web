import React, { useEffect, useRef, useState } from 'react';

import { Input, InputProps, forwardRef } from '@chakra-ui/react';
import CurrencyInput, { formatValue } from 'react-currency-input-field';
import { useTranslation } from 'react-i18next';

type CustomProps = {
  value?: number;
  defaultValue?: number;
  placeholder?: string | number;
  locale?: string;
  currency?: string | null;
  decimals?: number;
  onChange?(value?: number): void;
};

export type InputCurrencyProps = Overwrite<InputProps, CustomProps>;

export const InputCurrency = forwardRef<InputCurrencyProps, 'input'>(
  (
    {
      value = null,
      defaultValue = null,
      locale,
      currency = 'EUR',
      decimals = 2,
      onChange = () => undefined,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const { i18n } = useTranslation();

    const [internalValue, setInternalValue] = useState(
      String(value ?? defaultValue ?? '')
    );
    const isFirstMount = useRef(true);
    const internalValueRef = useRef(internalValue);
    internalValueRef.current = internalValue;

    useEffect(() => {
      if (!isFirstMount.current && String(value) !== internalValueRef.current) {
        setInternalValue(String(value ?? ''));
      }
      isFirstMount.current = false;
    }, [value]);

    const config = {
      intlConfig: {
        locale: locale || i18n.language,
        currency: currency ?? undefined,
      },
      decimalScale: decimals,
      disableAbbreviations: true,
    };

    return (
      <Input
        as={CurrencyInput}
        ref={ref}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        {...config}
        value={internalValue}
        onValueChange={(val: string) => {
          setInternalValue(val);
          onChange(val ? Number(val?.replace(',', '.')) : undefined);
        }}
        placeholder={
          typeof placeholder === 'number'
            ? formatValue({
                ...config,
                value: String(placeholder),
              })
            : placeholder
        }
        {...rest}
      />
    );
  }
);
