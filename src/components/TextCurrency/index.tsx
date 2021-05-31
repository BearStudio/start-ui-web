import React from 'react';

import { forwardRef, TextProps, Text } from '@chakra-ui/react';
import { formatValue } from 'react-currency-input-field';
import { useTranslation } from 'react-i18next';

export interface TextCurrencyProps extends TextProps {
  value: number;
  locale?: string;
  currency?: string;
  decimals?: number;
  groupSpace?: number;
}
export const TextCurrency = forwardRef<TextCurrencyProps, 'span'>(
  (
    { value, locale, currency = 'EUR', decimals = 2, groupSpace = 2, ...rest },
    ref
  ) => {
    const { i18n } = useTranslation();
    return (
      <Text ref={ref} sx={{ fontVariantNumeric: 'tabular-nums' }} {...rest}>
        {formatValue({
          value: String(value),
          intlConfig: { locale: locale || i18n.language, currency },
          decimalScale: decimals,
        })}
      </Text>
    );
  }
);
