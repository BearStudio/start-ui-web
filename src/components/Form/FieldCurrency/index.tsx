import { ReactNode } from 'react';

import {
  Flex,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { InputCurrency, InputCurrencyProps } from '@/components/InputCurrency';

import { FieldCommonProps } from '../FormField';
import { FormFieldError } from '../FormFieldError';
import { FormFieldHelper } from '../FormFieldHelper';
import { FormFieldItem } from '../FormFieldItem';
import { FormFieldLabel } from '../FormFieldLabel';

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
  'placeholder' | 'size' | 'autoFocus' | 'locale' | 'currency' | 'decimals'
> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldCurrency = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldCurrencyProps<TFieldValues, TName>
) => {
  const formatValue = (
    value: number | undefined,
    type: 'to-cents' | 'from-cents'
  ) => {
    if (value === undefined) return undefined;
    if (props.inCents !== true) return value;
    if (type === 'to-cents') return value * 100;
    if (type === 'from-cents') return value / 100;
  };

  return (
    <Controller
      {...props}
      render={({ field }) => (
        <FormFieldItem>
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          <Flex direction="column" flex={1} gap={1.5}>
            <InputGroup size={props.size}>
              <InputCurrency
                type={props.type}
                size={props.size}
                placeholder={
                  typeof props.placeholder === 'number'
                    ? formatValue(props.placeholder, 'from-cents')
                    : props.placeholder
                }
                autoFocus={props.autoFocus}
                locale={props.locale}
                currency={props.currency}
                decimals={props.decimals}
                {...field}
                value={formatValue(field.value, 'from-cents')}
                onChange={(v) => field.onChange(formatValue(v, 'to-cents'))}
                pl={props.startElement ? '2.5em' : undefined}
                pr={props.endElement ? '2.5em' : undefined}
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
            <FormFieldError />
          </Flex>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
        </FormFieldItem>
      )}
    />
  );
};
