import { ReactNode, createContext, forwardRef, useContext, useId } from 'react';

import { FormControl } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { useFormFieldContext } from './FormFieldContext';
import { FormFieldError } from './FormFieldError';
import { FormFieldHelper } from './FormFieldHelper';
import { FormFieldLabel } from './FormFieldLabel';

type FormItemContextValue = {
  id: string;
};

export const FormFieldItemContext = createContext<FormItemContextValue | null>(
  null
);

export const useFormFieldItemContext = () => {
  const ctx = useContext(FormFieldItemContext);
  if (!ctx) {
    throw new Error('Missing <FormFieldItem /> parent component');
  }
  return ctx;
};

export type FormFieldItemProps = {
  label?: ReactNode;
  helper?: ReactNode;
  requiredIndicator?: 'required' | 'optional';
  displayError?: boolean;
  children?: ReactNode;
};

export const FormFieldItem = forwardRef<HTMLDivElement, FormFieldItemProps>(
  ({ ...props }, ref) => {
    const id = useId();
    const fieldContext = useFormFieldContext();
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    return (
      <FormFieldItemContext.Provider value={{ id }}>
        <FormControl
          ref={ref}
          isInvalid={!!fieldState.error}
          display="flex"
          flexDirection="column"
          isRequired={fieldContext.optionalityHint === 'required'}
          gap={1}
        >
          {!!props.label && <FormFieldLabel>{props.label}</FormFieldLabel>}
          {props.children}
          {!!props.helper && <FormFieldHelper>{props.helper}</FormFieldHelper>}
          {props.displayError && <FormFieldError />}
        </FormControl>
      </FormFieldItemContext.Provider>
    );
  }
);
FormFieldItem.displayName = 'FormItem';
