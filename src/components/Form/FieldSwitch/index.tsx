import { Flex, Switch, SwitchProps } from '@chakra-ui/react';
import {
  Controller,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import { FieldCommonProps } from '../FormFieldController';
import { FormFieldError } from '../FormFieldError';

type SwitchRootProps = Pick<SwitchProps, 'size'>;

export type FieldSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  type: 'switch';
  switchProps?: RemoveFromType<
    RemoveFromType<
      Omit<SwitchProps, 'isChecked' | 'isDisabled'>,
      SwitchRootProps
    >,
    ControllerRenderProps
  >;
} & SwitchRootProps &
  FieldCommonProps<TFieldValues, TName>;

export const FieldSwitch = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: FieldSwitchProps<TFieldValues, TName>
) => {
  return (
    <Controller
      {...props}
      render={({ field: { value, ...field } }) => (
        <Flex direction="column" gap={1.5}>
          <Switch
            display="flex"
            alignItems="center"
            size={props.size}
            isChecked={!!value}
            isDisabled={props.isDisabled}
            {...props.switchProps}
            {...field}
          />
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
