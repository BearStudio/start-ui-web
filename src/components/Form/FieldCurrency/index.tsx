import { ReactNode } from 'react';

import {
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';
import { InputCurrency, InputCurrencyProps } from '@/components/InputCurrency';

export type FieldCurrencyProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'currency';
  label?: ReactNode;
  helper?: ReactNode;
  inCents?: boolean;
  startElement?: ReactNode;
  endElement?: ReactNode;
} & Pick<
  InputCurrencyProps,
  | 'placeholder'
  | 'size'
  | 'autoFocus'
  | 'locale'
  | 'currency'
  | 'decimals'
  | 'fixedDecimals'
  | 'prefix'
  | 'suffix'
> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldCurrency = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldCurrencyProps<TFieldValues, TName>
) => {
  const formatValue = (
    value: number | undefined | null,
    type: 'to-cents' | 'from-cents'
  ) => {
    if (value === undefined || value === null) return value;
    if (props.inCents !== true) return value;
    if (type === 'to-cents') return Math.round(value * 100);
    if (type === 'from-cents') return value / 100;
  };

  return (
    <Controller
      {...props}
      render={({ field }) => (
        <FormFieldItem>
          {!!props.label && (
            <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
          )}
          <InputGroup size={props.size}>
            <InputCurrency
              type={props.type}
              size={props.size}
              placeholder={
                (typeof props.placeholder === 'number'
                  ? formatValue(props.placeholder, 'from-cents')
                  : props.placeholder) ?? undefined
              }
              autoFocus={props.autoFocus}
              {...field}
              value={formatValue(field.value, 'from-cents')}
              onChange={(v) => field.onChange(formatValue(v, 'to-cents'))}
              pl={props.startElement ? '2.5em' : undefined}
              pr={props.endElement ? '2.5em' : undefined}
              prefix={props.prefix}
              suffix={props.suffix}
              locale={props.locale}
              currency={props.currency}
              decimals={props.decimals}
              fixedDecimals={props.fixedDecimals}
            />
            {!!props.startElement && (
              <InputLeftElement pointerEvents="none">
                {props.startElement}
              </InputLeftElement>
            )}
            {!!props.endElement && (
              <InputRightElement pointerEvents="none">
                {props.endElement}
              </InputRightElement>
            )}
          </InputGroup>

          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
