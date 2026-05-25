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
    defaultValues: { bears: [] as string[] },
    validators: { onSubmit: z.object({ bears: z.array(z.string()) }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Bearstronauts</FormFieldLabel>
        <form.AppField name="bears">
          {(field) => <field.FieldCheckboxGroup options={options} />}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default { Default };
