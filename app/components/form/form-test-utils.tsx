import { ReactNode } from 'react';
import { Schema } from 'zod';

import { useAppForm } from '@/lib/form/config';

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
    <form.AppForm>
      <form.Form>
        {children({ form })}
        <button type="submit">Submit</button>
      </form.Form>
    </form.AppForm>
  );
};
