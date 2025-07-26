import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { NestedCheckboxOption } from '@/components/form/field-nested-checkbox-group';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '..';

export default {
  title: 'Form/FieldNestedCheckboxGroup',
};

const zFormSchema = () =>
  z.object({
    bears: zu.array.nonEmpty(z.string().array(), 'Select at least one answer.'),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    bears: [],
  } as z.infer<ReturnType<typeof zFormSchema>>,
} as const;

const astrobears: Array<NestedCheckboxOption> = [
  {
    value: 'bearstrong',
    label: 'Bearstrong',
    children: undefined,
  },
  { value: 'pawdrin', label: 'Buzz Pawdrin', children: undefined },
  {
    value: 'grizzlyrin',
    label: 'Yuri Grizzlyrin',
    disabled: true,
    children: [
      {
        value: 'mini-grizzlyrin-1',
        label: 'Mini Grizzlyrin 1',
      },
      {
        value: 'mini-grizzlyrin-2',
        label: 'Mini Grizzlyrin 2',
      },
    ],
  },
];

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={[
              {
                label: 'Astrobears',
                value: 'astrobears',
                children: astrobears,
              },
            ]}
          />
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
      bears: ['grizzlyrin', 'mini-grizzlyrin-1', 'mini-grizzlyrin-2'],
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={[
              {
                label: 'Astrobears',
                value: 'astrobears',
                children: astrobears,
              },
            ]}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            type="nested-checkbox-group"
            control={form.control}
            name="bears"
            options={[
              {
                label: 'Astrobears',
                value: 'astrobears',
                children: astrobears,
              },
            ]}
            disabled
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
