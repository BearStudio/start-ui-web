import { ActivityIcon } from 'lucide-react';
import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';
import { zu } from '@/lib/zod/zod-utils';

import { Form } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldText',
};

const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
  });

const formOptions: Parameters<typeof useAppForm>[0] = {
  validators: { onBlur: zFormSchema() },
  defaultValues: {
    name: '',
  },
  onSubmit,
};

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText placeholder="Buzz Pawdrin" />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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
      name: 'Default Name',
    },
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText type="text" placeholder="Buzz Pawdrin" />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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
  const form = useAppForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText placeholder="Buzz Pawdrin" disabled />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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

export const ReadOnly = () => {
  const form = useAppForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText placeholder="Buzz Pawdrin" readOnly />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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

export const StartElement = () => {
  const form = useAppForm(formOptions);

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText
                placeholder="Buzz Pawdrin"
                startElement={<ActivityIcon />}
              />

              <field.FormFieldHelper>Help</field.FormFieldHelper>
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
