import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FieldContextMeta } from '@/components/form/form-field';

type FormFieldLabelProps = ComponentProps<'label'>;

export const FormFieldLabel = ({
  className,
  ...props
}: FormFieldLabelProps) => {
  const ctx = useFieldContext();
  const meta = useStore(ctx.store, (state) => {
    const fieldMeta = state.meta as FieldContextMeta;
    return {
      id: fieldMeta.id,
    };
  });
  return (
    <label
      htmlFor={meta.id}
      className={cn('flex gap-1.5 align-baseline text-sm', className)}
      {...props}
    />
  );
};
