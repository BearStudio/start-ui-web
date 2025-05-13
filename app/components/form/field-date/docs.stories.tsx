import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';

import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldDate',
};

const zFormSchema = () =>
  z.object({
    date: z.date(),
  });

const formOptions: Parameters<typeof useAppForm>[0] = {
  validators: { onSubmit: zFormSchema() },
  defaultValues: {
    date: null as unknown as Date,
  },
  onSubmit,
};

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="date">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Date</field.FormFieldLabel>
                <field.FieldDate placeholder="DD/MM/YYYY" />
                <field.FormFieldHelper>Help</field.FormFieldHelper>
              </field.FormField>
            )}
          </form.AppField>
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export const DefaultValue = () => {
  const form = useAppForm({
    ...formOptions,
    defaultValues: { date: new Date() },
  });

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="date">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Date</field.FormFieldLabel>
                <field.FieldDate placeholder="DD/MM/YYYY" />
                <field.FormFieldHelper>Help</field.FormFieldHelper>
              </field.FormField>
            )}
          </form.AppField>
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export const CalendarCustomization = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="date">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Date</field.FormFieldLabel>
                <field.FieldDate
                  placeholder="DD/MM/YYYY"
                  calendarProps={{
                    startMonth: new Date(),
                  }}
                />
                <field.FormFieldHelper>Help</field.FormFieldHelper>
              </field.FormField>
            )}
          </form.AppField>
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form.Form>
    </form.AppForm>
  );
};
