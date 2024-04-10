import { createContext, useContext } from 'react';

import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { useFormFieldItemContext } from './FormFieldItem';

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  optionalityHint?: 'required' | 'optional' | false;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export const useFormFieldContext = () => {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error('Missing <FormField /> parent component');
  }
  return ctx;
};

export const useFormField = () => {
  const fieldContext = useFormFieldContext();
  const itemContext = useFormFieldItemContext();
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    formItemId: `${id}-form-item`,
    formHelperId: `${id}-form-item-helper`,
    formErrorId: `${id}-form-item-error`,
    ...fieldContext,
    ...fieldState,
  };
};
