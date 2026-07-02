import {
  DeepKeys,
  revalidateLogic,
  StandardSchemaV1,
  useForm as useTanStackForm,
} from '@tanstack/react-form';
import { z } from 'zod';

import { FormInstance } from '@/components/form/types';

type UseFormOptions<TSchema extends z.ZodType> = {
  schema: TSchema;
  /**
   * Validation trigger before the first submission attempt. After the first
   * submission, fields always revalidate on change (react-hook-form parity).
   */
  mode?: 'change' | 'blur' | 'submit';
  defaultValues: NoInfer<z.input<TSchema>>;
  onSubmit?: (values: z.output<TSchema>) => unknown | Promise<unknown>;
};

export function useForm<TSchema extends z.ZodType>({
  schema,
  mode = 'submit',
  defaultValues,
  onSubmit,
}: UseFormOptions<TSchema>) {
  return useTanStackForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode }),
    validators: {
      onDynamic: schema as StandardSchemaV1<
        z.input<TSchema>,
        z.output<TSchema>
      >,
    },
    onSubmit: async ({ value }) => {
      // Parse to apply schema transforms (trim, empty string to null, ...)
      await onSubmit?.(schema.parse(value));
    },
  });
}

/**
 * Set a field error from outside validation (like a server error). The error
 * clears on the next revalidation, like react-hook-form's setError.
 */
export function setFormFieldError<TFormData>(
  form: FormInstance<TFormData>,
  name: DeepKeys<TFormData>,
  message: string
) {
  form.setErrorMap({
    onDynamic: {
      fields: { [name]: message },
      form: undefined,
    },
  } as ExplicitAny);
}
