import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export default {
  title: 'Form/FieldSelect',
} satisfies Meta<typeof Select>;

const zFormSchema = () =>
  z.object({
    color: z.enum(['red', 'green', 'blue']),
  });

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
] as const;

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  // TODO: the form error does not pop
  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
            options={options}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm<z.infer<ReturnType<typeof zFormSchema>>>({
    ...formOptions,
    defaultValues: {
      color: 'blue',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
            options={options}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm<z.infer<ReturnType<typeof zFormSchema>>>({
    ...formOptions,
    defaultValues: {
      color: 'blue',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
            disabled
            options={options}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
