import {
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
} from 'react';

import { FormControl } from '@chakra-ui/react';
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
};

export const FormFieldItem = forwardRef<HTMLDivElement, FormFieldItemProps>(
  ({ ...props }, ref) => {
    const id = useId();
    const fieldContext = useFormFieldContext();
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    const contextValue = useMemo(() => ({ id }), [id]);

    const getGap = () => {
      if (fieldContext.layout !== 'row') return;
      if (fieldContext.size === 'lg') return 5;
      if (fieldContext.size === 'md') return 4;
      if (fieldContext.size === 'sm') return 3;
    };

    return (
      <FormFieldItemContext.Provider value={contextValue}>
        <FormControl
          ref={ref}
          isInvalid={!!fieldState.error}
          display="flex"
          isRequired={fieldContext.optionalityHint === 'required'}
          isDisabled={fieldContext.isDisabled}
          id={props.id}
          {...(fieldContext.layout === 'row'
            ? {
                flexDirection: 'row',
                alignItems: 'start',
                rowGap: 1,
                columnGap: getGap(),
              }
            : {
                flexDirection: 'column',
                gap: 1,
              })}
        >
          {props.children}
        </FormControl>
      </FormFieldItemContext.Provider>
    );
  }
);
FormFieldItem.displayName = 'FormItem';
