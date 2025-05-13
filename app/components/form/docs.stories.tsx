import { Meta } from '@storybook/react';
import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';
import { zu } from '@/lib/zod/zod-utils';

import { Form } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default {
  title: 'Form/Form',
} satisfies Meta<typeof Form>;

const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
    other: zu.string.nonEmpty(z.string()),
  });

export const Default = () => {
  const form = useAppForm({
    validators: { onBlur: zFormSchema() },
    defaultValues: {
      name: '',
      other: '',
    },
    onSubmit,
  });

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="name">
          {(field) => (
            <field.FormField size="lg">
              <field.FormFieldLabel>Name</field.FormFieldLabel>
              <field.FieldText />
              <field.FormFieldHelper>
                This is an helper text
              </field.FormFieldHelper>
            </field.FormField>
          )}
        </form.AppField>

        <form.AppField name="other">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Other (Custom)</field.FormFieldLabel>
              <Input
                value={field.state.value ?? ''}
                onChange={(e) => field.setValue(e.target.value)}
              />
              <field.FormFieldError />
            </field.FormField>
          )}
        </form.AppField>

        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </form.Form>
  );
};
