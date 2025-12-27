import { createContext, use } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';

export type NonGenericFormFieldControllerContextValue =
  FormFieldControllerContextValue<FieldValues>;

export type FormFieldControllerContextValue<
  TFieldValues extends FieldValues = FieldValues,
> = {
  field: ControllerRenderProps<TFieldValues>;
  fieldState: ControllerFieldState;
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
