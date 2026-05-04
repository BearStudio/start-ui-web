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
  const form = useForm<z.infer<T>>({
    mode: 'onBlur',
    resolver: zodResolver(schema as TODO),
    ...useFormOptions,
  });
  const defaultValues = useFormOptions?.defaultValues;
  const defaultValueKeys =
    defaultValues && typeof defaultValues === 'object'
      ? Object.keys(defaultValues)
      : [];
  const handleSubmit: SubmitHandler<z.infer<T>> | undefined = onSubmit
    ? (values) =>
        onSubmit({
          ...Object.fromEntries(
            defaultValueKeys.map((key) => [key, undefined])
          ),
          ...values,
        } as z.infer<T>)
    : undefined;

  return (
    <Form {...form} onSubmit={handleSubmit}>
      {children({ form })}
      <button type="submit">Submit</button>
    </Form>
  );
};
