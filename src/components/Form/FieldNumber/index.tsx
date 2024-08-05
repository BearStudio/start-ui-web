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
import { InputNumber, InputNumberProps } from '@/components/InputNumber';

type InputNumberRootProps = Pick<
  InputNumberProps,
  | 'placeholder'
  | 'size'
  | 'autoFocus'
  | 'locale'
  | 'currency'
  | 'precision'
  | 'fixedPrecision'
  | 'prefix'
  | 'suffix'
  | 'min'
  | 'max'
  | 'step'
  | 'bigStep'
>;

export type FieldNumberProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'number';
  inCents?: boolean;
  startElement?: ReactNode;
  endElement?: ReactNode;
  inputNumberProps?: RemoveFromType<
    RemoveFromType<InputNumberProps, InputNumberRootProps>,
    ControllerRenderProps
  >;
  containerProps?: FlexProps;
} & InputNumberRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldNumber = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldNumberProps<TFieldValues, TName>
) => {
  const formatValue = (
    value: number | undefined | null,
    type: 'to-cents' | 'from-cents'
  ) => {
    if (value === undefined || value === null) return null;
    if (props.inCents !== true) return value ?? null;
    if (type === 'to-cents') return Math.round(value * 100);
    if (type === 'from-cents') return value / 100;
    return null;
  };

  return (
    <Controller
      {...props}
      render={({ field }) => (
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <InputGroup size={props.size}>
            <InputNumber
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
              precision={props.precision}
              fixedPrecision={props.fixedPrecision}
              min={props.min}
              max={props.max}
              step={props.step}
              bigStep={props.bigStep}
              isDisabled={props.isDisabled}
              {...props.inputNumberProps}
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
