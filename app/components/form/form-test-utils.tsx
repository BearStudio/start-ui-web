import { ReactNode } from 'react';
import { Schema } from 'zod';

import { useAppForm } from '@/lib/form/config';

import { Form } from '@/components/form';

export const FormMocked = <T extends Schema>({
  children,
  schema,
  useFormOptions,
  onSubmit,
}: {
  children(options: { form: ReturnType<typeof useAppForm> }): ReactNode;
  schema: T;
  useFormOptions?: Parameters<typeof useAppForm>[0];
  onSubmit?: Parameters<typeof useAppForm>[0]['onSubmit'];
}) => {
  const form = useAppForm({
    validators: { onBlur: schema },
    ...useFormOptions,
    onSubmit,
  });
  return (
    <Form form={form}>
      {children({ form })}
      <button type="submit">Submit</button>
    </Form>
  );
};
