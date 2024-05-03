import { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { Schema, z } from 'zod';

import { Form } from '.';

export const FormMocked = <T extends Schema>({
  children,
  schema,
  useFormOptions = {},
  onSubmit,
}: {
  children(options: { form: UseFormReturn<z.infer<T>> }): ReactNode;
  schema: T;
  useFormOptions?: UseFormProps<z.infer<T>>;
  onSubmit?: SubmitHandler<z.infer<T>>;
}) => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    ...useFormOptions,
  });
  return (
    <Form
      {...form}
      onSubmit={
        onSubmit ? form.handleSubmit((values) => onSubmit(values)) : undefined
      }
    >
      {children({ form })}
      <button type="submit">Submit</button>
    </Form>
  );
};
