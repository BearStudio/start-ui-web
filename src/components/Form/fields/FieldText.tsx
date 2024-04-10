import { Input, InputProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FormFieldControl } from '@/components/Form/FormFieldControl';

import { FieldCommonProps } from '../FormField';
import { FormFieldItem } from '../FormFieldItem';

export type FieldTextProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'text' | 'email' | 'number' | 'tel';
  placeholder?: string;
  size?: InputProps['size'];
  autoFocus?: boolean;
} & FieldCommonProps<TFieldValues, TName>;

export const FieldText = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldTextProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => (
        <FormFieldItem label={props.label} helper={props.helper} displayError>
          <FormFieldControl>
            <Input
              type={props.type}
              size={props.size}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              {...field}
            />
          </FormFieldControl>
        </FormFieldItem>
      )}
    />
  );
};
