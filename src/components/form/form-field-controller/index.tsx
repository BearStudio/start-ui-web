import { AnyFieldApi, DeepKeys, Field, useStore } from '@tanstack/react-form';
import { ReactNode } from 'react';

import {
  FieldComponentProps,
  fieldComponents,
  FieldType,
} from '@/components/form/_fields';
import { FormInstance } from '@/components/form/types';

import { FormFieldControllerContext } from './context';

type FormFieldControllerCustomRender = (props: {
  field: AnyFieldApi;
  fieldState: AnyFieldApi['state'];
}) => ReactNode;

export function FormFieldController<
  TFormData = ExplicitAny,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
>(
  props: (
    | {
        [K in FieldType]: { type: K } & Omit<
          FieldComponentProps<K>,
          'form' | 'name'
        >;
      }[FieldType]
    | {
        type: 'custom';
        render: FormFieldControllerCustomRender;
      }
  ) & {
    form: FormInstance<TFormData>;
    name: TName;
    disabled?: boolean;
    displayError?: boolean;
  }
) {
  const { name, form, displayError = true, type, ...fieldProps } = props;

  return (
    <Field form={form as ExplicitAny} name={name as string}>
      {(field) => (
        <FormFieldControllerRender
          field={field}
          type={type}
          displayError={displayError}
          fieldProps={fieldProps}
          customRender={type === 'custom' ? props.render : undefined}
        />
      )}
    </Field>
  );
}

function FormFieldControllerRender({
  field,
  type,
  displayError,
  fieldProps,
  customRender,
}: {
  field: AnyFieldApi;
  type: FieldType | 'custom';
  displayError: boolean;
  fieldProps: Record<string, unknown>;
  customRender?: FormFieldControllerCustomRender;
}) {
  // Subscribed snapshot (new identity on each field state update) so the
  // context value and custom renders stay reactive under React Compiler
  // memoization — a bare `field.state` read would be cached on `field`.
  const fieldState = useStore(field.store) as AnyFieldApi['state'];
  const isInvalid = !fieldState.meta.isValid;

  const contextValue = {
    type,
    displayError,
    field,
    fieldState,
    isInvalid,
  };

  const fieldContent = (() => {
    if (type === 'custom') return customRender?.({ field, fieldState });
    const FieldComponent = fieldComponents[type];
    return (
      <FieldComponent {...(fieldProps as FieldComponentProps<ExplicitAny>)} />
    );
  })();

  return (
    <FormFieldControllerContext value={contextValue}>
      {fieldContent}
    </FormFieldControllerContext>
  );
}
