import { useMemo } from 'react';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';

import {
  FieldComponentProps,
  fieldComponents,
  FieldType,
} from '@/components/new-form/_fields';

import {
  FormFieldControllerContext,
  NonGenericFormFieldControllerContextValue,
} from './context';

type FormFieldControllerBaseProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues,
> = Omit<ControllerProps<TFieldValues, TName, TTransformedValues>, 'render'> & {
  displayError?: boolean;
};

export type FormFieldControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues = TFieldValues,
> = {
  [K in FieldType]: {
    type: K;
  } & FieldComponentProps<K> &
    FormFieldControllerBaseProps<TFieldValues, TName, TTransformedValues>;
}[FieldType];

export function FormFieldController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedsValues extends FieldValues = TFieldValues,
>(props: FormFieldControllerProps<TFieldValues, TName, TTransformedsValues>) {
  const {
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    displayError,
    type,
    ...fieldProps
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      disabled={fieldProps.disabled}
      rules={rules}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        // This is a render function so it's fine
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const contextValue = useMemo(
          () => ({
            displayError: displayError ?? true,
            field,
            fieldState,
          }),
          [field, fieldState]
        );

        const Field = fieldComponents[type];

        return (
          <FormFieldControllerContext
            value={contextValue as NonGenericFormFieldControllerContextValue}
          >
            <Field {...(fieldProps as FieldComponentProps<ExplicitAny>)} />
          </FormFieldControllerContext>
        );
      }}
    />
  );
}
