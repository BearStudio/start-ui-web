import { useMemo } from 'react';
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';

import {
  FieldComponents,
  fieldComponents,
} from '@/components/new-form/_field-components';
import {
  FormControllerContext,
  FormControllerContextValue,
} from '@/components/new-form/form-controller/context';

export type FormControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = WithRequired<
  UseControllerProps<TFieldValues, TName, TTransformedValues>,
  'name'
> &
  Pick<FormControllerContextValue, 'size'> & {
    render: (
      field: {
        props: ControllerRenderProps<TFieldValues, TName>;
        state: ControllerFieldState;
      } & FieldComponents
    ) => React.ReactNode;
  };

/**
 * Inspired by @tanstack/react-form
 *
 * @see https://github.com/TanStack/form/blob/main/packages/react-form/src/createFormHook.tsx
 */
export function FormController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  render,
  size,
  ...controllerProps
}: FormControllerProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        const id = field.name;
        // We are inside a render function so it's fine
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const fieldCtx = useMemo(
          () => ({
            labelId: `${id}-label`,
            errorId: `${id}-error`,
            descriptionId: `${id}-description`,
            field,
            fieldState,
            size,
          }),
          [field, fieldState, id]
        ) as FormControllerContextValue;

        return (
          <FormControllerContext value={fieldCtx}>
            {render({
              props: field,
              ...fieldComponents,
              state: fieldState,
            })}
          </FormControllerContext>
        );
      }}
    />
  );
}
