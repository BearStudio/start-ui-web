import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';
import { zu } from '@/lib/zod/zod-utils';

import { Form } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldOtp',
};

const zFormSchema = (options: { length?: number } = {}) => {
  const length = options.length ?? 6;
  return z.object({
    code: zu.string.nonEmpty(
      z
        .string()
        .min(length, `Code is ${length} digits`)
        .max(length, `Code is ${length} digits`),
      {
        required_error: 'Code is required',
      }
    ),
  });
};

const formOptions: Parameters<typeof useAppForm>[0] = {
  validators: { onBlur: zFormSchema() },
  defaultValues: { code: '' },
  onSubmit,
};

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <form.AppField name="code">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Code</field.FormFieldLabel>
              <field.FieldOtp maxLength={6} />
            </field.FormField>
          )}
        </form.AppField>

        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useAppForm({
    ...formOptions,
    defaultValues: {
      code: '927342',
    },
  });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <form.AppField name="code">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Code</field.FormFieldLabel>
              <field.FieldOtp maxLength={6} />
            </field.FormField>
          )}
        </form.AppField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useAppForm(formOptions);

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <form.AppField name="code">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Code</field.FormFieldLabel>
              <field.FieldOtp maxLength={6} disabled />
            </field.FormField>
          )}
        </form.AppField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const CustomLength = () => {
  const form = useAppForm({
    ...formOptions,
    validators: { onSubmit: zFormSchema({ length: 4 }) },
  });

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <form.AppField name="code">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Code</field.FormFieldLabel>
              <field.FieldOtp maxLength={4} />
            </field.FormField>
          )}
        </form.AppField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const AutoSubmit = () => {
  const form = useAppForm(formOptions);

  return (
    <Form form={form}>
      <div className="flex max-w-sm flex-col gap-4">
        <form.AppField name="code">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Code</field.FormFieldLabel>
              <field.FieldOtp maxLength={6} autoSubmit />
            </field.FormField>
          )}
        </form.AppField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
