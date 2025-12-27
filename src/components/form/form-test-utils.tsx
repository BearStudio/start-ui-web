import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode } from 'react';
import {
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormProps,
  UseFormReturn,
} from 'react-hook-form';
import { z, ZodType } from 'zod';

import { Form } from '@/components/form';

export const FormMocked = <T extends ZodType<FieldValues>>({
  children,
  schema,
  useFormOptions,
  onSubmit,
}: {
  children(options: { form: UseFormReturn<z.infer<T>> }): ReactNode;
  schema: T;
  useFormOptions?: UseFormProps<z.infer<T>>;
  onSubmit?: SubmitHandler<z.infer<T>>;
}) => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(schema as TODO),
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
