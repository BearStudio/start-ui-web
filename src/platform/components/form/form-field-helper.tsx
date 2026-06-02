import { ComponentProps } from 'react';

import { cn } from '@/platform/lib/tailwind/utils';

import { useFormField } from './form-field-context';

export const FormFieldHelper = ({
  className,
  ...props
}: ComponentProps<'div'>) => {
  const ctx = useFormField();
  return (
    <div
      id={ctx.descriptionId}
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
};
