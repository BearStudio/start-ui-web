import { Meta } from '@storybook/react';
import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';

import { onSubmit } from '@/components/form/docs.utils';
import FieldNumber from '@/components/form/field-number';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldNumber',
} satisfies Meta<typeof FieldNumber>;

const zFormSchema = () =>
  z.object({
    balance: z.number().min(0),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zFormSchema(),
  onSubmit,
  defaultValues: { balance: '' },
} as const;

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="balance">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Balance</field.FormFieldLabel>
              <field.FieldNumber placeholder="Bearcoin" />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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

export const DefaultValue = () => {
  const form = useAppForm({
    ...formOptions,
    defaultValues: {
      balance: 30,
    },
  });

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="balance">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Balance</field.FormFieldLabel>
              <field.FieldNumber placeholder="Bearcoin" />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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

export const Currency = () => {
  const form = useAppForm(formOptions);

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="balance">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Balance</field.FormFieldLabel>
              <field.FieldNumber
                placeholder="Bearcoin"
                format={{
                  style: 'currency',
                  currency: 'EUR',
                }}
                inCents
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
  );
};

export const Disabled = () => {
  const form = useAppForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="balance">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Balance</field.FormFieldLabel>
              <field.FieldNumber placeholder="Bearcoin" disabled />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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

export const ReadOnly = () => {
  const form = useAppForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <form.Form>
      <div className="flex flex-col gap-4">
        <form.AppField name="balance">
          {(field) => (
            <field.FormField>
              <field.FormFieldLabel>Balance</field.FormFieldLabel>
              <field.FieldNumber placeholder="Bearcoin" readOnly />
              <field.FormFieldHelper>Help</field.FormFieldHelper>
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
