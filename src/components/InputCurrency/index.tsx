import React, { useEffect, useRef, useState } from 'react';

import { Input, InputProps, forwardRef } from '@chakra-ui/react';
import CurrencyInput, {
  CurrencyInputProps,
  formatValue,
} from 'react-currency-input-field';
import { useTranslation } from 'react-i18next';

type CustomProps = {
  value?: number | null;
  defaultValue?: number;
  placeholder?: string | number;
  locale?: string;
  currency?: string | null;
  suffix?: string;
  decimals?: number;
  onChange?(value: number | null): void;
};

export type InputCurrencyProps = Overwrite<InputProps, CustomProps>;

export const InputCurrency = forwardRef<InputCurrencyProps, 'input'>(
  (
    {
      value = null,
      defaultValue = null,
      locale,
      suffix,
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
        currency: !suffix ? currency ?? undefined : undefined,
      },
      decimalScale: decimals,
      disableAbbreviations: true,
      suffix,
    };

    const onValueChange: CurrencyInputProps['onValueChange'] = (
      _,
      __,
      params
    ) => {
      if (!params) return;
      setInternalValue(params.value);
      onChange(params.value ? params.float : null);
    };

    return (
      <Input
        as={CurrencyInput}
        ref={ref}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        {...config}
        value={internalValue}
        onValueChange={onValueChange}
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
