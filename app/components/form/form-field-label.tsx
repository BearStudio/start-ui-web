import { useStore } from '@tanstack/react-form';
import { ComponentProps } from 'react';

import { useFormContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

type FormFieldLabelProps = ComponentProps<'label'>;

export const FormFieldLabel = ({
  className,
  ...props
}: FormFieldLabelProps) => {
  const ctx = useFormContext();
  const meta = useStore(ctx.store, (state) => ({
    id: state.meta.id,
  }));
  return (
    <label
      htmlFor={meta.id}
      className={cn('flex gap-1.5 align-baseline text-sm', className)}
      {...props}
    />
  );
};
