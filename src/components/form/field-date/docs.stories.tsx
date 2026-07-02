import { z } from 'zod';

import { FormFieldController, useForm } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '..';

export default {
  title: 'Form/FieldDate',
};

const zFormSchema = () =>
  z.object({
    date: z.date({ error: 'Required' }),
  });

const formOptions = {
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {
    date: null as unknown as Date,
  },
} as const;

export const Default = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Date</FormFieldLabel>
          <FormFieldController
            type="date"
            form={form}
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

export const CalendarCustomization = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Date</FormFieldLabel>
          <FormFieldController
            type="date"
            form={form}
            name="date"
            placeholder="DD/MM/YYYY"
            calendarProps={{
              startMonth: new Date(),
            }}
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
