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
  FormFieldContext,
  FormFieldContextValue,
  FormFieldSize,
} from '@/components/new-form/form-field/context';
import { Field } from '@/components/ui/field';

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = WithRequired<
  UseControllerProps<TFieldValues, TName, TTransformedValues>,
  'name'
> & {
  size?: FormFieldSize;
  children: (
    field: {
      props: ControllerRenderProps<TFieldValues, TName>;
      state: ControllerFieldState;
    } & FieldComponents
  ) => React.ReactNode;
};

/**
 * Inspired by from @tanstack/react-form
 *
 * @see https://github.com/TanStack/form/blob/main/packages/react-form/src/createFormHook.tsx
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  children,
  size,
  ...controllerProps
}: FormFieldProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...controllerProps}
      render={({ field, fieldState }) => {
        // We are inside a render function so it's fine
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const fieldCtx = useMemo(
          () => ({
            field,
            fieldState,
            size,
          }),
          [field, fieldState]
        ) as FormFieldContextValue;

        return (
          <Field data-invalid={fieldState.invalid}>
            <FormFieldContext value={fieldCtx}>
              {children({
                props: field,
                ...fieldComponents,
                state: fieldState,
              })}
            </FormFieldContext>
          </Field>
        );
      }}
    />
  );
}
