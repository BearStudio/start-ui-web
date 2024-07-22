import { Checkbox, CheckboxProps, Flex } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldCommonProps } from '../FormFieldController';
import { FormFieldError } from '../FormFieldError';

export type CheckboxRootProps = Pick<CheckboxProps, 'size'>;

export type FieldCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'checkbox';
  checkboxProps?: RemoveFromType<
    RemoveFromType<
      Omit<CheckboxProps, 'isChecked' | 'isDisabled'>,
      CheckboxRootProps
    >,
    ControllerRenderProps
  >;
} & CheckboxRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldCheckboxProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { value, ...field } }) => (
        <Flex direction="column" gap={1.5}>
          <Checkbox
            isChecked={!!value}
            isDisabled={props.isDisabled}
            {...props.checkboxProps}
            {...field}
          />
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
