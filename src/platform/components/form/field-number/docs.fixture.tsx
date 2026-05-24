import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const zFormSchema = () =>
  z.object({
    balance: z.number({ error: 'Required' }).min(0),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

const Default = () => {
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

const DefaultValue = () => {
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

const Currency = () => {
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

const Disabled = () => {
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

const ReadOnly = () => {
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

export default {
  Default,
  DefaultValue,
  Currency,
  Disabled,
  ReadOnly,
};
