import { Textarea, TextareaProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FormFieldControl } from '@/components/Form/FormFieldControl';

import { FieldCommonProps } from '../FormField';
import { FormFieldItem } from '../FormFieldItem';

export type FieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'textarea';
  placeholder?: string;
  size?: TextareaProps['size'];
  autoFocus?: boolean;
  rows?: number;
} & FieldCommonProps<TFieldValues, TName>;

export const FieldTextarea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldTextareaProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field }) => (
        <FormFieldItem label={props.label} helper={props.helper} displayError>
          <FormFieldControl>
            <Textarea
              size={props.size}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              rows={props.rows}
              {...field}
            />
          </FormFieldControl>
        </FormFieldItem>
      )}
    />
  );
};
