import { type ReactNode, useId, useMemo } from 'react';

import { cn } from '@/platform/lib/tailwind/utils';

import { FormFieldContext } from '@/platform/components/form/form-field-context';
import { FormFieldSize } from '@/platform/components/form/types';

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
