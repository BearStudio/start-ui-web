import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
];

const Default = () => {
  const form = useAppForm({
    defaultValues: { bear: '' },
    validators: { onSubmit: z.object({ bear: z.string() }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Bearstronaut</FormFieldLabel>
        <form.AppField name="bear">
          {(field) => <field.FieldSelect items={options} />}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default { Default };
