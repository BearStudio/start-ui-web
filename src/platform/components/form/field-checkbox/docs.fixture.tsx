import { z } from 'zod';

import { Form, FormField, useAppForm } from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const Default = () => {
  const form = useAppForm({
    defaultValues: { lovesBears: false },
    validators: { onSubmit: z.object({ lovesBears: z.boolean() }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <form.AppField name="lovesBears">
          {(field) => <field.FieldCheckbox>I love bears</field.FieldCheckbox>}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default { Default };
