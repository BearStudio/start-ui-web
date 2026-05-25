import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const Default = () => {
  const form = useAppForm({
    defaultValues: { date: new Date() },
    validators: { onSubmit: z.object({ date: z.date() }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Date</FormFieldLabel>
        <form.AppField name="date">
          {(field) => <field.FieldDate />}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default { Default };
