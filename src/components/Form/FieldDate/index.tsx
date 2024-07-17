import { Flex, FlexProps, InputProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import {
  DayPicker,
  DayPickerInputProps,
  DayPickerProps,
} from '@/components/DayPicker';
import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

type DayPickerInputRootProps = Pick<
  InputProps,
  'size' | 'autoFocus' | 'placeholder'
>;

export type FieldDateProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'date';
  dayPickerProps?: RemoveFromType<DayPickerProps, ControllerRenderProps>;
  dayPickerInputProps?: RemoveFromType<
    DayPickerInputProps,
    DayPickerInputRootProps
  >;
  containerProps?: FlexProps;
} & DayPickerInputRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldDate = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldDateProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { ref: _ref, ...field } }) => (
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <DayPicker
            placeholder={props.placeholder}
            isDisabled={props.isDisabled}
            inputProps={{
              size: props.size,
              autoFocus: props.autoFocus,
              ...props.dayPickerInputProps,
            }}
            {...props.dayPickerProps}
            {...field}
          />
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
