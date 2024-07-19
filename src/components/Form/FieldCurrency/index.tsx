import { ReactNode } from 'react';

import {
  Flex,
  FlexProps,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { InputCurrency, InputCurrencyProps } from '@/components/InputCurrency';

type InputCurrencyRootProps = Pick<
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
>;

export type FieldCurrencyProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'currency';
  inCents?: boolean;
  startElement?: ReactNode;
  endElement?: ReactNode;
  inputCurrencyProps?: RemoveFromType<
    RemoveFromType<InputCurrencyProps, InputCurrencyRootProps>,
    ControllerRenderProps
  >;
  containerProps?: FlexProps;
} & InputCurrencyRootProps &
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
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
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
              ps={props.startElement ? '2.5em' : undefined}
              pe={props.endElement ? '2.5em' : undefined}
              prefix={props.prefix}
              suffix={props.suffix}
              locale={props.locale}
              currency={props.currency}
              decimals={props.decimals}
              fixedDecimals={props.fixedDecimals}
              isDisabled={props.isDisabled}
              {...props.inputCurrencyProps}
              {...field}
              value={formatValue(field.value, 'from-cents')}
              onChange={(v) => field.onChange(formatValue(v, 'to-cents'))}
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
      )}
    />
  );
};
