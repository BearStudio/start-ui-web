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

export function FormFieldController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues = TFieldValues,
>(
  props: (
    | { [K in FieldType]: { type: K } & FieldComponentProps<K> }[FieldType]
    | {
        type: 'custom';
        render: ControllerProps<
          TFieldValues,
          TName,
          TTransformedValues
        >['render'];
      }
  ) &
    Omit<ControllerProps<TFieldValues, TName, TTransformedValues>, 'render'> & {
      displayError?: boolean;
    }
) {
  const {
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    displayError = true,
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
      render={(renderProps) => (
        <FormFieldControllerRender
          {...renderProps}
          type={type}
          displayError={displayError}
          fieldProps={fieldProps}
          customRender={type === 'custom' ? props.render : undefined}
        />
      )}
    />
  );
}

function FormFieldControllerRender<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  formState,
  type,
  displayError,
  fieldProps,
  customRender,
}: Parameters<ControllerProps<TFieldValues, TName>['render']>[0] & {
  type: FieldType | 'custom';
  displayError: boolean;
  fieldProps: Record<string, unknown>;
  customRender?: ControllerProps<TFieldValues, TName>['render'];
}) {
  const contextValue = useMemo(
    () => ({ type, displayError, field, fieldState }),
    [type, displayError, field, fieldState]
  );

  const fieldContent = useMemo(() => {
    if (type === 'custom')
      return customRender?.({ field, fieldState, formState });
    const Field = fieldComponents[type];
    return <Field {...(fieldProps as FieldComponentProps<ExplicitAny>)} />;
  }, [type, customRender, field, fieldState, formState, fieldProps]);

  return (
    <FormFieldControllerContext
      value={contextValue as NonGenericFormFieldControllerContextValue}
    >
      {fieldContent}
    </FormFieldControllerContext>
  );
}
