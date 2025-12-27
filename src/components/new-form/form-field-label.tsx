import { ComponentProps } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { useFormField } from './form-field';

type FormFieldLabelProps = ComponentProps<'label'>;

export const FormFieldLabel = ({
  className,
  ...props
}: FormFieldLabelProps) => {
  const ctx = useFormField();
  return (
    <label
      id={ctx.labelId}
      htmlFor={ctx.id}
      className={cn('flex gap-1.5 align-baseline text-sm', className)}
      {...props}
    />
  );
};
