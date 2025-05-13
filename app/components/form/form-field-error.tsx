import { useStore } from '@tanstack/react-form';
import { AlertCircleIcon } from 'lucide-react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

export const FormFieldError = (props: { className?: string }) => {
  const field = useFieldContext<unknown>();

  const errorMessage = useStore(field.store, (state) => {
    return state.meta.errors[0]?.message;
  });

  if (!errorMessage) {
    return null;
  }

  return (
    <div
      id={field.getMeta().errorId}
      className={cn(
        'flex animate-in gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        props.className
      )}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {errorMessage}
    </div>
  );
};
