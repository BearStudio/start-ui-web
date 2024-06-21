export const isNumber = (value: unknown): boolean =>
  typeof parseFloat(String(value)) === 'number' &&
  !isNaN(parseFloat(String(value))) &&
  !isNaN(Number(value));

export const getNumberFormatInfo = (params: {
  locale: string;
  currency?: string | null;
}) => {
  const intl = new Intl.NumberFormat(
    params.locale,
    params.currency
      ? {
          style: 'currency',
          currency: params.currency,
        }
      : undefined
  );

  const decimalsSeparator = intl
    .formatToParts(1)
    .find((part) => part.type === 'decimal')?.value;

  const groupSeparator = intl
    .formatToParts(1000.1)
    .find((part) => part.type === 'group')?.value;

  const currencySymbol = intl
    .formatToParts(1)
    .find((part) => part.type === 'currency')?.value;

  const currencyPosition =
    intl.formatToParts(1).findIndex((part) => part.type === 'currency') === 0
      ? 'start'
      : 'end';

  const currencyPrefix =
    currencyPosition === 'start' && currencySymbol ? currencySymbol : '';
  const currencySuffix =
    currencyPosition === 'end' && currencySymbol ? ` ${currencySymbol}` : '';

  return {
    decimalsSeparator,
    groupSeparator,
    currencySymbol,
    currencyPosition,
    currencyPrefix,
    currencySuffix,
  } as const;
};
