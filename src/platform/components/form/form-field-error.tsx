import { AlertCircleIcon } from 'lucide-react';
import { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/platform/lib/tailwind/utils';

import { useFormFieldUnsafe } from '@/platform/components/form/form-field';

export type FieldErrorInput = unknown;

const extractMessage = (raw: FieldErrorInput): string | undefined => {
  if (raw == null) return undefined;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && 'message' in raw) {
    const message = (raw as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }
  return undefined;
};

type FormFieldErrorProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * Errors coming from the field. Accepts the TanStack Form
   * `field.state.meta.errors` array (containing standard-schema issues or
   * raw strings).
   */
  errors?: FieldErrorInput[] | null;
  children?: (params: { message: string }) => ReactNode;
};

/**
 * Renders the first non-empty error message for the surrounding `<FormField>`.
 * Messages flow through i18n so presentation schemas can emit error codes and
 * the UI translates at render time.
 */
export const FormFieldError = ({
  className,
  errors,
  children,
  ...rest
}: FormFieldErrorProps) => {
  const fieldCtx = useFormFieldUnsafe();
  const { t } = useTranslation();

  const rawMessage = (errors ?? [])
    .map((e) => extractMessage(e))
    .find((m): m is string => Boolean(m));

  if (!rawMessage) return null;

  const message = t(rawMessage, { defaultValue: rawMessage });

  if (children) return children({ message });

  return (
    <div
      id={fieldCtx?.errorId}
      className={cn(
        'flex animate-in gap-1 text-sm text-negative-600 slide-in-from-top-1 dark:text-negative-400',
        className
      )}
      role="alert"
      {...rest}
    >
      <AlertCircleIcon size="1em" className="my-0.5 flex-none" />
      {message}
    </div>
  );
};
