import React from 'react';

import { Text, TextProps, forwardRef } from '@chakra-ui/react';
import { formatValue } from 'react-currency-input-field';
import { useTranslation } from 'react-i18next';

export type TextCurrencyProps = TextProps & {
  value: number;
  locale?: string;
  currency?: string;
  decimals?: number;
};

export const TextCurrency = forwardRef<TextCurrencyProps, 'span'>(
  ({ value, locale, currency = 'EUR', decimals = 2, ...rest }, ref) => {
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
