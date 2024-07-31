import React, { ChangeEvent, ComponentProps, useRef, useState } from 'react';

import {
  Input,
  InputProps,
  UseNumberInputProps,
  forwardRef,
  useNumberInput,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NumericFormat, numericFormatter } from 'react-number-format';

import { getNumberFormatInfo } from '@/lib/numbers';

type CustomProps = {
  value?: number | null;
  defaultValue?: number | null;
  /**
   * Provide a number and the placeholder will also display the currency format,
   * prefix and suffix.
   * Provide a string and the placeholder will display only the placeholder
   */
  placeholder?: string | number;
  locale?: string;
  /**
   * Intl.NumberFormat options that will put the style as currency and set the
   * currency code to the given value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
   * @see https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes
   */
  currency?: string | null;
  /** Will be displayed before the value (and placeholder if placeholder is a number) in the input */
  prefix?: string;
  /** Will be displayed after the value (and placeholder if placeholder is a number) in the input */
  suffix?: string;
  /**
   * The number of decimal points used to round the value
   */
  precision?: number;
  fixedDecimals?: boolean;
  onChange?(value: number | null): void;
};

export type InputNumberProps = Overwrite<UseNumberInputProps, CustomProps>;

export const InputNumber = forwardRef<InputNumberProps, 'input'>(
  (
    {
      value,
      defaultValue,
      locale,
      currency = null,
      prefix = '',
      suffix = '',
      precision = 0,
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

    const updateValue = (v: number | null) => {
      setInternalValue(v);
      onChange(v);
    };

    const [internalValue, setInternalValue] = useState(
      value ?? defaultValue ?? null
    );
    const [isFocused, setIsFocused] = useState(false);
    const tmpValueRef = useRef(internalValue);

    const getNumericFormatOptions = () =>
      ({
        getInputRef: ref,
        decimalScale: precision,
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

    const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
      useNumberInput({
        defaultValue: defaultValue ?? undefined,
        // TODO NaN quand vide
        value: value === undefined ? undefined : value ?? undefined,
        onChange: (_, valueAsNumber) => updateValue(valueAsNumber),
        ...rest,
        ...getNumericFormatOptions(),

        onFocus: (e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        },
        onBlur: (e) => {
          setIsFocused(false);
          updateValue(tmpValueRef.current);
          rest.onBlur?.(e);
        },
        // onKeyDown: (e) => {
        //   if (e.key === 'Enter') {
        //     updateValue(tmpValueRef.current);
        //   }
        //   rest.onKeyDown?.(e);
        // },
      });

    const inputProps = getInputProps();

    return (
      <Input
        as={NumericFormat}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        {...inputProps}
        placeholder={
          typeof placeholder === 'number'
            ? numericFormatter(String(placeholder), {
                ...getNumericFormatOptions(),
                fixedDecimalScale: fixedDecimals,
              })
            : placeholder
        }
      />
    );
  }
);
