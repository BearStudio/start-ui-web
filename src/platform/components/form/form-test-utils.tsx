import type { ReactNode } from 'react';
import type { z, ZodType } from 'zod';

import { Form } from '@/platform/components/form/form';
import { useAppForm } from '@/platform/components/form/use-app-form';

type AnyForm = ReturnType<typeof useAppForm>;

/**
 * Renders children inside a TanStack Form instance bound to the given zod
 * schema. `children` receives the form so callers can drop `form.AppField`
 * children that mirror real form layouts.
 */
export const FormMocked = <T extends ZodType<Record<string, unknown>>>({
  children,
  schema,
  defaultValues,
  onSubmit,
}: {
  children(options: { form: AnyForm }): ReactNode;
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit?: (values: z.infer<T>) => void | Promise<void>;
}) => {
  const form = useAppForm({
    defaultValues: defaultValues ?? {},
    // zod 4 implements standard-schema, which is what TF expects here.
    // The cast is required because TF's validator type is wider than zod.
    validators: { onSubmit: schema as unknown as never },
    onSubmit: async ({ value }) => {
      await onSubmit?.(value as z.infer<T>);
    },
  }) as unknown as AnyForm;

  return (
    <Form form={form}>
      {children({ form })}
      <button type="submit">Submit</button>
    </Form>
  );
};
