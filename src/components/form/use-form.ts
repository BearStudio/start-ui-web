import {
  revalidateLogic,
  StandardSchemaV1,
  useForm as useTanStackForm,
} from '@tanstack/react-form';
import { z } from 'zod';

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
