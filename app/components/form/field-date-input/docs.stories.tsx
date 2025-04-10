import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldController } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldDateInput',
};

const zFormSchema = () =>
  z.object({
    date: z.date().nullable(),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    date: null,
  },
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Date</FormFieldLabel>
          <FormFieldController
            type="date"
            control={form.control}
            name="date"
            placeholder="DD/MM/YYYY"
          />
          <FormFieldHelper>Help</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
