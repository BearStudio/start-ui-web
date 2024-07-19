import {
  ElementRef,
  ReactNode,
  createContext,
  useContext,
  useId,
  useMemo,
} from 'react';

import { FormControl, FormControlProps } from '@chakra-ui/react';

import { fixedForwardRef } from '@/lib/utils';

type FormFieldSize = 'sm' | 'md' | 'lg';

type FormFieldProps = {
  id?: string;
  size?: FormFieldSize;
  formControlProps?: FormControlProps;
  children?: ReactNode;
};

const FormFieldComponent = (
  props: FormFieldProps,
  ref: ElementRef<typeof FormControl>
) => {
  const _id = useId();
  const id = props.id ?? _id;

  const contextValue = useMemo(
    () => ({
      id,
      size: props.size,
    }),
    [id, props.size]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <FormControl
        ref={ref}
        display="flex"
        flexDirection="column"
        id={id}
        gap={1}
        {...props.formControlProps}
      >
        {props.children}
      </FormControl>
    </FormFieldContext.Provider>
  );
};

export const FormField = fixedForwardRef(FormFieldComponent);

type FormFieldContextValue = {
  id: string;
  size?: FormFieldSize;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  if (!fieldContext) {
    throw new Error('Missing <FormField /> parent component');
  }

  return {
    ...fieldContext,
  };
};
