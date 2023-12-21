import React, { ReactNode } from 'react';

import {
  Radio,
  RadioGroup,
  RadioGroupProps,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';

type Option = {
  value?: string;
  label?: ReactNode;
};

export type FieldRadiosProps<FormattedValue = Option['value']> = FieldProps<
  Option['value'],
  FormattedValue
> &
  FormGroupProps & {
    radioGroupProps?: RadioGroupProps;
    options?: Option[];
  };

export const FieldRadios = <FormattedValue = Option['value'],>(
  props: FieldRadiosProps<FormattedValue>
) => {
  const field = useField(props);

  const { options, radioGroupProps, children, ...rest } = field.otherProps;

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
  } satisfies FormGroupProps;

  return (
    <FormGroup {...formGroupProps}>
      <RadioGroup
        {...radioGroupProps}
        id={field.id}
        value={field.value ?? undefined}
        onChange={field.setValue}
      >
        <Wrap spacing="4" overflow="visible">
          {options?.map((option) => (
            <WrapItem key={option.value}>
              <Radio
                id={`${field.id}-${option.value}`}
                name={field.id}
                value={option.value}
              >
                {option.label ?? option.value}
              </Radio>
            </WrapItem>
          ))}
        </Wrap>
      </RadioGroup>
      {children}
    </FormGroup>
  );
};
