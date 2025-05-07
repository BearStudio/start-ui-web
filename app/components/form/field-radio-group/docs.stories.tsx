import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldRadioGroup',
};

const zFormSchema = () =>
  z.object({
    bear: zu.string.nonEmpty(z.string(), {
      required_error: 'Please select your favorite bearstronaut',
    }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    bear: '',
  },
} as const;

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
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
            type="radio-group"
            control={form.control}
            name="bear"
            options={options}
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
      bear: 'pawdrin',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            control={form.control}
            type="radio-group"
            name="bear"
            options={options}
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
  const form = useForm({
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
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            control={form.control}
            type="radio-group"
            name="bear"
            options={options}
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

export const Row = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            control={form.control}
            type="radio-group"
            name="bear"
            options={options}
            className="flex-row gap-4"
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const WithDisabledOption = () => {
  const form = useForm(formOptions);

  const optionsWithDisabled = [
    { value: 'bearstrong', label: 'Bearstrong' },
    { value: 'pawdrin', label: 'Buzz Pawdrin' },
    { value: 'grizzlyrin', label: 'Yuri Grizzlyrin', disabled: true },
  ];

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            control={form.control}
            type="radio-group"
            name="bear"
            options={optionsWithDisabled}
            className="flex-row gap-4"
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
