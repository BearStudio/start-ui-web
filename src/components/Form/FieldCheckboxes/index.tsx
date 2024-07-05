import { ReactNode } from 'react';

import {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupProps,
  Flex,
  FlexProps,
} from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues, PathValue } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

export type FieldCheckboxesProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'checkboxes';
  label?: ReactNode;
  helper?: ReactNode;
  rowGap?: FlexProps['rowGap'];
  columnGap?: FlexProps['columnGap'];
  direction?: FlexProps['direction'];
  options?: Readonly<
    Readonly<{
      label: string;
      value: PathValue<TFieldValues, TName>[number];
    }>[]
  >;
  children?: ReactNode;
} & Pick<CheckboxGroupProps, 'size'> &
  FieldCommonProps<TFieldValues, TName>;

export const FieldCheckboxes = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldCheckboxesProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { ref: _ref, ...field } }) => (
        <FormFieldItem>
          {!!props.label && (
            <FormFieldLabel size={props.size}>{props.label}</FormFieldLabel>
          )}
          <CheckboxGroup size={props.size} {...field}>
            {!!props.options && (
              <Flex
                columnGap={props.columnGap ?? 4}
                rowGap={props.rowGap ?? 1.5}
                direction={props.direction ?? 'column'}
              >
                {props.options.map((option) => (
                  <Checkbox key={option.value} value={option.value}>
                    {option.label}
                  </Checkbox>
                ))}
              </Flex>
            )}
            {props.children}
          </CheckboxGroup>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
