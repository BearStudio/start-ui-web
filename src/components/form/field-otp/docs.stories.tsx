import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
  useForm,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldOtp',
};

const zFormSchema = (options: { length?: number } = {}) => {
  const length = options.length ?? 6;
  return z.object({
    code: zu.fieldText
      .required({ error: 'Invalid code' })
      .pipe(
        z
          .string()
          .min(length, `Code is ${length} digits`)
          .max(length, `Code is ${length} digits`)
      ),
  });
};

const formOptions = {
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {} as z.input<ReturnType<typeof zFormSchema>>,
} as const;

export const Default = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            form={form}
            name="code"
            maxLength={6}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      code: '927342',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            form={form}
            name="code"
            maxLength={6}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            form={form}
            name="code"
            maxLength={6}
            disabled
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const CustomLength = () => {
  const form = useForm({
    ...formOptions,
    schema: zFormSchema({ length: 4 }),
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            form={form}
            name="code"
            maxLength={4}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const AutoSubmit = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController
            type="otp"
            form={form}
            name="code"
            maxLength={6}
            autoSubmit
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
