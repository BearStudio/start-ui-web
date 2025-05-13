import { Meta } from '@storybook/react';
import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';

import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export default {
  title: 'Form/FieldSelect',
} satisfies Meta<typeof Select>;

const zFormSchema = () =>
  z.object({
    bear: z.enum([
      'bearstrong',
      'pawdrin',
      'grizzlyrin',
      'jemibear',
      'ridepaw',
      'michaelpawanderson',
    ]),
  });

const options = [
  {
    id: 'bearstrong',
    label: 'Bearstrong',
  },
  {
    id: 'pawdrin',
    label: 'Buzz Pawdrin',
  },
  {
    id: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
  },
  {
    id: 'jemibear',
    label: 'Mae Jemibear',
    disabled: true,
  },
  {
    id: 'ridepaw',
    label: 'Sally Ridepaw',
  },
  {
    id: 'michaelpawanderson',
    label: 'Michael Paw Anderson',
  },
] as const;

const formOptions: Parameters<typeof useAppForm>[0] = {
  validators: { onSubmit: zFormSchema() },
  onSubmit,
  defaultValues: { bear: '' },
};

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="bear">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Bearstronaut</field.FormFieldLabel>
                <field.FieldSelect
                  placeholder="Placeholder"
                  options={options}
                />
              </field.FormField>
            )}
          </form.AppField>

          <Button type="submit">Submit</Button>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export const DefaultValue = () => {
  const form = useAppForm({
    ...formOptions,
    defaultValues: {
      bear: 'bearstrong',
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="bear">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Bearstronaut</field.FormFieldLabel>
                <field.FieldSelect
                  placeholder="Placeholder"
                  options={options}
                />
              </field.FormField>
            )}
          </form.AppField>
          <Button type="submit">Submit</Button>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export const Disabled = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
      <form.Form>
        <div className="flex flex-col gap-4">
          <form.AppField name="bear">
            {(field) => (
              <field.FormField>
                <field.FormFieldLabel>Bearstronaut</field.FormFieldLabel>
                <field.FieldSelect
                  placeholder="Placeholder"
                  options={options}
                  disabled
                />
              </field.FormField>
            )}
          </form.AppField>

          <Button type="submit">Submit</Button>
        </div>
      </form.Form>
    </form.AppForm>
  );
};

export const ReadOnly = () => {
  const form = useForm<z.infer<ReturnType<typeof zFormSchema>>>({
    ...formOptions,
    defaultValues: {
      bear: 'michaelpawanderson',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="bear"
            placeholder="Placeholder"
            readOnly
            options={options}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
