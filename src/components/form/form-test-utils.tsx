import { ReactNode } from 'react';
import { z } from 'zod';

import { Form } from '@/components/form';
import { FormInstance } from '@/components/form/types';
import { useForm } from '@/components/form/use-form';

export const FormMocked = <T extends z.ZodType>({
  children,
  schema,
  useFormOptions,
  onSubmit,
}: {
  children(options: { form: FormInstance<z.input<T>> }): ReactNode;
  schema: T;
  useFormOptions?: { defaultValues?: z.input<T> };
  onSubmit?: (values: z.output<T>) => void;
}) => {
  const form = useForm({
    schema,
    mode: 'blur',
    defaultValues: useFormOptions?.defaultValues as z.input<T>,
    onSubmit,
  });
  return (
    <Form form={form}>
      {children({ form })}
      <button type="submit">Submit</button>
    </Form>
  );
};
