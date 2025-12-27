import { createContext, ReactNode, use, useId, useMemo } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldSize } from '@/components/form/types';

type FormFieldProps = {
  id?: string;
  size?: FormFieldSize;
  children?: ReactNode;
  className?: string;
};

export const FormField = (props: FormFieldProps) => {
  const _id = useId();
  const id = props.id ?? _id;

  const contextValue = useMemo(
    () => ({
      id,
      labelId: `${id}-label`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      size: props.size,
    }),
    [id, props.size]
  );

  return (
    <FormFieldContext value={contextValue}>
      <div className={cn('flex flex-col gap-1.5', props.className)}>
        {props.children}
      </div>
    </FormFieldContext>
  );
};

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
