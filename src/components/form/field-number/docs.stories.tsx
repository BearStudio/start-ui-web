import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { FieldNumber } from '@/components/form/field-number';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldNumber',
} satisfies Meta<typeof FieldNumber>;

const zFormSchema = () =>
  z.object({
    balance: z.number({ error: 'Required' }).min(0),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
            placeholder="Bearcoin"
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

export const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      balance: 30,
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
            placeholder="Bearcoin"
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

export const Currency = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            type="number"
            control={form.control}
            name="balance"
            placeholder="Bearcoin"
            format={{
              style: 'currency',
              currency: 'EUR',
            }}
            inCents
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

export const Disabled = () => {
  const form = useForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            disabled
            type="number"
            control={form.control}
            name="balance"
            placeholder="Bearcoin"
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

export const ReadOnly = () => {
  const form = useForm({ ...formOptions, defaultValues: { balance: 42 } });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Balance</FormFieldLabel>
          <FormFieldController
            readOnly
            type="number"
            control={form.control}
            name="balance"
            placeholder="Bearcoin"
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
