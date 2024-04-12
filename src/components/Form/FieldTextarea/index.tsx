import { ReactNode } from 'react';

import { Textarea, TextareaProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldCommonProps } from '../FormField';
import { FormFieldControl } from '../FormFieldControl';
import { FormFieldError } from '../FormFieldError';
import { FormFieldHelper } from '../FormFieldHelper';
import { FormFieldItem } from '../FormFieldItem';
import { FormFieldLabel } from '../FormFieldLabel';

export type FieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'textarea';
  label?: ReactNode;
  helper?: ReactNode;
} & Pick<TextareaProps, 'placeholder' | 'size' | 'autoFocus' | 'rows'> &
  FieldCommonProps<TFieldValues, TName>;

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
        <FormFieldItem>
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          <FormFieldControl>
            <Textarea
              size={props.size}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              rows={props.rows}
              {...field}
            />
          </FormFieldControl>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          <FormFieldError />
        </FormFieldItem>
      )}
    />
  );
};
