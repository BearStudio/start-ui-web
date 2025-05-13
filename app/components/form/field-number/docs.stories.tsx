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

const formOptions: Parameters<typeof useAppForm>[0] = {
  validators: { onBlur: zFormSchema() },
  onSubmit,
  defaultValues: { balance: 0 },
};

export const Default = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
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
    </form.AppForm>
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
    <form.AppForm>
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
    </form.AppForm>
  );
};

export const Currency = () => {
  const form = useAppForm(formOptions);

  return (
    <form.AppForm>
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
    </form.AppForm>
  );
};

export const Disabled = () => {
  const form = useAppForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <form.AppForm>
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
    </form.AppForm>
  );
};

export const ReadOnly = () => {
  const form = useAppForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <form.AppForm>
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
    </form.AppForm>
  );
};
