import { Flex, FlexProps, Textarea, TextareaProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormFieldController';
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
  containerProps?: FlexProps;
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
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <Textarea
            size={props.size}
            placeholder={props.placeholder}
            autoFocus={props.autoFocus}
            rows={props.rows}
            isDisabled={props.isDisabled}
            {...props.textareaProps}
            {...field}
          />
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
