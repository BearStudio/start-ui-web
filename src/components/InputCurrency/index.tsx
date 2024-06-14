import React, { ComponentProps, useRef, useState } from 'react';

import { Input, InputProps, forwardRef } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NumericFormat, numericFormatter } from 'react-number-format';

import { getNumberFormatInfo } from '@/lib/numbers';

type CustomProps = {
  value?: number | null;
  defaultValue?: number | null;
  placeholder?: string | number;
  locale?: string;
  currency?: string | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  fixedDecimals?: boolean;
  onChange?(value: number | null): void;
};

export type InputCurrencyProps = Overwrite<InputProps, CustomProps>;

export const InputCurrency = forwardRef<InputCurrencyProps, 'input'>(
  (
    {
      value,
      defaultValue,
      locale,
      currency = 'EUR',
      prefix = '',
      suffix = '',
      decimals = 2,
      fixedDecimals = true,
      onChange = () => undefined,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const {
      decimalsSeparator,
      groupSeparator,
      currencyPrefix,
      currencySuffix,
    } = getNumberFormatInfo({
      locale: locale ?? i18n.language,
      currency,
    });

    const [internalValue, setInternalValue] = useState(
      value ?? defaultValue ?? null
    );
    const [isFocused, setIsFocused] = useState(false);
    const tmpValueRef = useRef(internalValue);

    const updateValue = (v: number | null) => {
      setInternalValue(v);
      onChange(v);
    };

    const getNumericFormatOptions = (v: number | null) =>
      ({
        getInputRef: ref,
        decimalScale: decimals,
        fixedDecimalScale: !isFocused ? fixedDecimals : false,
        decimalSeparator: decimalsSeparator ?? '.',
        thousandSeparator: groupSeparator ?? ',',
        suffix: `${currencySuffix}${suffix}`,
        prefix: `${currencyPrefix}${prefix}`,
        onValueChange: (values) => {
          tmpValueRef.current = values.floatValue ?? null;

          // Prevent -0 to be replaced with 0 when input is controlled
          if (values.floatValue === 0) return;

          updateValue(values.floatValue ?? null);
        },
      }) satisfies ComponentProps<typeof NumericFormat>;

    return (
      <Input
        as={NumericFormat}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        {...rest}
        {...getNumericFormatOptions(internalValue)}
        value={value === undefined ? undefined : value ?? ''}
        defaultValue={defaultValue ?? undefined}
        placeholder={
          typeof placeholder === 'number'
            ? numericFormatter(String(placeholder), {
                ...getNumericFormatOptions(placeholder),
                fixedDecimalScale: fixedDecimals,
              })
            : placeholder
        }
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          updateValue(tmpValueRef.current);
          rest.onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateValue(tmpValueRef.current);
          }
          rest.onKeyDown?.(e);
        }}
      />
    );
  }
);
