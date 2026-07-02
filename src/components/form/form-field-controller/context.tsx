import { AnyFieldApi } from '@tanstack/react-form';
import { createContext, use } from 'react';

import { FieldType } from '@/components/form/_fields';

export type FormFieldControllerContextValue = {
  type: FieldType | 'custom';
  field: AnyFieldApi;
  fieldState: AnyFieldApi['state'];
  isInvalid: boolean;
  displayError?: boolean;
};

export const FormFieldControllerContext =
  createContext<FormFieldControllerContextValue | null>(null);

export function useFormFieldController() {
  const context = use(FormFieldControllerContext);

  if (!context)
    throw new Error(
      'useFormFieldController must be used within a <FormFieldController />'
    );

  return context;
}
