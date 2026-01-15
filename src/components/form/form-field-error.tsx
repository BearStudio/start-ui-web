import { AlertCircleIcon } from 'lucide-react';
import { useMemo } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { useFormFieldUnsafe } from './form-field';

export function FormFieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const fieldCtx = useFormFieldUnsafe();
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            // eslint-disable-next-line @eslint-react/no-array-index-key
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      id={fieldCtx?.errorId}
      className={cn(
        'flex animate-in items-center gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        className
      )}
      {...props}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {content}
    </div>
  );
}
