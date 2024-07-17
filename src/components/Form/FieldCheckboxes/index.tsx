import { ReactNode } from 'react';

import {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupProps,
  CheckboxProps,
  Flex,
  FlexProps,
} from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  PathValue,
} from 'react-hook-form';

import { FieldCommonProps } from '@/components/Form/FormFieldController';
import { FormFieldError } from '@/components/Form/FormFieldError';

export type FieldCheckboxesProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'checkboxes';
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
  checkboxProps?: Omit<CheckboxProps, 'value' | 'children'>;
  checkboxGroupProps?: RemoveFromType<
    CheckboxGroupProps,
    ControllerRenderProps
  >;
  containerProps?: FlexProps;
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
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <CheckboxGroup
            size={props.size}
            isDisabled={props.isDisabled}
            {...field}
            {...props.checkboxGroupProps}
          >
            {!!props.options && (
              <Flex
                columnGap={props.columnGap ?? 4}
                rowGap={props.rowGap ?? 1.5}
                direction={props.direction ?? 'column'}
              >
                {props.options.map((option) => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    {...props.checkboxProps}
                  >
                    {option.label}
                  </Checkbox>
                ))}
              </Flex>
            )}
            {props.children}
          </CheckboxGroup>
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
