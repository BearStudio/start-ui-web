import { Textarea, TextareaProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormField';
import { FormFieldError } from '@/components/Form/FormFieldError';

type TextareaRootProps = Pick<
  TextareaProps,
  'placeholder' | 'size' | 'autoFocus' | 'rows'
>;
export type FieldTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'textarea';
  textareaProps?: RemoveFromType<
    RemoveFromType<TextareaProps, TextareaRootProps>,
    ControllerRenderProps
  >;
} & TextareaRootProps &
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
        <>
          <Textarea
            size={props.size}
            placeholder={props.placeholder}
            autoFocus={props.autoFocus}
            rows={props.rows}
            {...props.textareaProps}
            {...field}
          />
          <FormFieldError name={props.name} control={props.control} />
        </>
      )}
    />
  );
};
