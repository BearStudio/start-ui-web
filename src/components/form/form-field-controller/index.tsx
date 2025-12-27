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
} from '@/components/form/_fields';

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
> = (
  | {
      [K in FieldType]: {
        type: K;
      } & FieldComponentProps<K>;
    }[FieldType]
  | {
      type: 'custom';
      render: ControllerProps<
        TFieldValues,
        TName,
        TTransformedValues
      >['render'];
    }
) &
  FormFieldControllerBaseProps<TFieldValues, TName, TTransformedValues>;

export function FormFieldController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues = TFieldValues,
>(props: FormFieldControllerProps<TFieldValues, TName, TTransformedValues>) {
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
      render={({ field, fieldState, formState }) => {
        // This is a render function so it's fine
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const contextValue = useMemo(
          () => ({
            type,
            displayError: displayError ?? true,
            field,
            fieldState,
          }),
          [field, fieldState]
        );

        // This is a render function so it's fine
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const fieldContent = useMemo(() => {
          if (type === 'custom')
            return props.render({ field, fieldState, formState });

          const Field = fieldComponents[type];

          return (
            <Field {...(fieldProps as FieldComponentProps<ExplicitAny>)} />
          );
        }, [field, fieldState, formState]);

        return (
          <FormFieldControllerContext
            value={contextValue as NonGenericFormFieldControllerContextValue}
          >
            {fieldContent}
          </FormFieldControllerContext>
        );
      }}
    />
  );
}
