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
    value: 'bearstrong',
    label: 'Bearstrong',
  },
  {
    value: 'pawdrin',
    label: 'Buzz Pawdrin',
  },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
  },
  {
    value: 'jemibear',
    label: 'Mae Jemibear',
    disabled: true,
  },
  {
    value: 'ridepaw',
    label: 'Sally Ridepaw',
  },
  {
    value: 'michaelpawanderson',
    label: 'Michael Paw Anderson',
  },
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
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="bear"
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
      bear: 'pawdrin',
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
            disabled
            options={options}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
