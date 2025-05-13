import { useStore } from '@tanstack/react-form';
import { AlertCircleIcon } from 'lucide-react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

import { FieldContextMeta } from '@/components/form/form-field';

export const FormFieldError = (props: { className?: string }) => {
  const field = useFieldContext<unknown>();

  const meta = useStore(field.store, (state) => {
    const fieldMeta = state.meta as FieldContextMeta;
    return {
      errorMessage: fieldMeta.errors[0]?.message,
      errorId: fieldMeta.errorId,
    };
  });

  if (!meta.errorMessage) {
    return null;
  }

  return (
    <div
      id={meta.errorId}
      className={cn(
        'flex animate-in gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        props.className
      )}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {meta.errorMessage}
    </div>
  );
};
