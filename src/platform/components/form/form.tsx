import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/platform/lib/tailwind/utils';

type FormLike = {
  handleSubmit: () => unknown;
};

type FormProps = Omit<ComponentProps<'form'>, 'onSubmit' | 'children'> & {
  /**
   * The TanStack Form instance returned by `useAppForm`. Submission is
   * delegated to `form.handleSubmit()`; the `onSubmit` config on the form
   * itself is the only place that runs the actual side-effects.
   */
  form: FormLike;
  /**
   * Render the bare `<FormProvider>` shape without an HTML `<form>` element.
   * Useful when a parent already owns the form element or when the form is
   * embedded in non-form UI (e.g. dialog action bar).
   */
  noHtmlForm?: boolean;
  children?: ReactNode;
};

/**
 * Thin wrapper around an HTML form element that wires submission into the
 * TanStack Form instance. Subforms or composed pages can opt out of the
 * outer `<form>` via `noHtmlForm`.
 */
export const Form = ({
  form,
  noHtmlForm = false,
  className,
  children,
  ...rest
}: FormProps) => {
  if (noHtmlForm) {
    return <>{children}</>;
  }

  return (
    <form
      noValidate
      {...rest}
      className={cn('flex flex-1 flex-col', className)}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {children}
    </form>
  );
};
