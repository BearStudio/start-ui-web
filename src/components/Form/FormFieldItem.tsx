import {
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
} from 'react';

import { FormControl, FormControlProps } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { useFormFieldContext } from './FormField';

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
  children?: ReactNode;
  id?: string;
  formControProps?: FormControlProps;
};

export const FormFieldItem = forwardRef<HTMLDivElement, FormFieldItemProps>(
  ({ ...props }, ref) => {
    const id = useId();
    const fieldContext = useFormFieldContext();
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    const contextValue = useMemo(() => ({ id }), [id]);

    return (
      <FormFieldItemContext.Provider value={contextValue}>
        <FormControl
          ref={ref}
          isInvalid={!!fieldState.error}
          display="flex"
          flexDirection="column"
          isRequired={fieldContext.optionalityHint === 'required'}
          isDisabled={fieldContext.isDisabled}
          id={props.id}
          gap={1}
          {...props.formControProps}
        >
          {props.children}
        </FormControl>
      </FormFieldItemContext.Provider>
    );
  }
);
FormFieldItem.displayName = 'FormItem';
