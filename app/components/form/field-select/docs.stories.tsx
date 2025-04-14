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
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      color: 'blue',
    },
  });

  // TODO This story does not work as expected yet (it should fill the input)
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

// TODO This story does not work as expected yet (it should not block the form submit)
export const Disabled = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
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
