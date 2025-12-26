import { createContext, use } from 'react';
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';

import { FormFieldSize } from '@/components/new-form/types';

export type FormControllerContextValue = {
  size?: FormFieldSize;
  errorId?: string;
  labelId?: string;
  descriptionId?: string;
  field: ControllerRenderProps<FieldValues>;
  fieldState: ControllerFieldState;
};

export const FormControllerContext =
  createContext<FormControllerContextValue | null>(null);

export const useFormControllerContext = () => {
  const context = use(FormControllerContext);

  if (!context) throw new Error('Missing <FormField /> parent component.');

  return context;
};
