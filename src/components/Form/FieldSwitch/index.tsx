import { ReactNode } from 'react';

import { Flex, FlexProps, Switch, SwitchProps } from '@chakra-ui/react';
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
  label?: ReactNode;
  switchProps?: RemoveFromType<
    RemoveFromType<
      Omit<SwitchProps, 'isChecked' | 'isDisabled' | 'children'>,
      SwitchRootProps
    >,
    ControllerRenderProps
  >;
  containerProps?: FlexProps;
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
        <Flex flexDirection="column" gap={1} flex={1} {...props.containerProps}>
          <Switch
            display="flex"
            alignItems="center"
            size={props.size}
            isChecked={!!value}
            isDisabled={props.isDisabled}
            {...props.switchProps}
            {...field}
          >
            {props.label}
          </Switch>
          <FormFieldError />
        </Flex>
      )}
    />
  );
};
