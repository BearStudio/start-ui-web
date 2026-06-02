import { createContext, use } from 'react';

import type { FormFieldSize } from '@/platform/components/form/types';

type FormFieldContextValue = {
  id: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  size?: FormFieldSize;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export const useFormField = () => {
  const fieldContext = use(FormFieldContext);
  if (!fieldContext) {
    throw new Error('Missing <FormField /> parent component');
  }
  return {
    ...fieldContext,
    describedBy: (invalid: boolean) =>
      invalid
        ? `${fieldContext.descriptionId} ${fieldContext.errorId}`
        : fieldContext.descriptionId,
  };
};

export const useFormFieldUnsafe = () => {
  return use(FormFieldContext);
};
