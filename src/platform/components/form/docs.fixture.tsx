import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldHelper,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required(),
    other: zu.fieldText.required(),
  });

const Default = () => {
  const form = useAppForm({
    defaultValues: { name: '', other: '' },
    validators: { onSubmit: zFormSchema() },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField size="lg">
          <FormFieldLabel>Name</FormFieldLabel>
          <form.AppField name="name">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
          <FormFieldHelper>This is an helper text</FormFieldHelper>
        </FormField>
        <FormField>
          <FormFieldLabel>Other</FormFieldLabel>
          <form.AppField name="other">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export default { Default };
