import { ReactNode } from 'react';

import { Flex, Textarea, TextareaProps } from '@chakra-ui/react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';
import { FormFieldHelper } from '@/components/Form/FormFieldHelper';
import { FormFieldItem } from '@/components/Form/FormFieldItem';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';

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
          <Flex direction="column" flex={1} gap={1.5}>
            <Textarea
              size={props.size}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              rows={props.rows}
              {...field}
            />
            <FormFieldError />
          </Flex>
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
        </FormFieldItem>
      )}
    />
  );
};
