import { createContext, use } from 'react';
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';

export type FormFieldSize = 'sm' | 'default' | 'lg';

export type FormFieldContextValue = {
  size: FormFieldSize;
  field: ControllerRenderProps<FieldValues>;
  fieldState: ControllerFieldState;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export const useFormField = () => {
  const context = use(FormFieldContext);

  if (!context) throw new Error('Missing <FormField /> parent component.');

  return context;
};
