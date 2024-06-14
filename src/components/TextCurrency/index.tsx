import React from 'react';

import { Text, TextProps, forwardRef } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { numericFormatter } from 'react-number-format';

import { getNumberFormatInfo } from '@/lib/numbers';

export type TextCurrencyProps = TextProps & {
  value?: number | null;
  locale?: string;
  currency?: string | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  fixedDecimals?: boolean;
};

export const TextCurrency = forwardRef<TextCurrencyProps, 'span'>(
  (
    {
      value,
      locale,
      currency = 'EUR',
      prefix = '',
      suffix = '',
      decimals = 2,
      fixedDecimals = true,
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

    return (
      <Text
        ref={ref}
        sx={{ fontVariantNumeric: 'tabular-nums' }}
        opacity={value === null ? 0.6 : undefined}
        {...rest}
      >
        {value !== null
          ? numericFormatter(String(value), {
              decimalScale: decimals,
              fixedDecimalScale: fixedDecimals,
              decimalSeparator: decimalsSeparator ?? '.',
              thousandSeparator: groupSeparator ?? ',',
              suffix: `${currencySuffix}${suffix}`,
              prefix: `${currencyPrefix}${prefix}`,
            })
          : 'N/A'}
      </Text>
    );
  }
);
