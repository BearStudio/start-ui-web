import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/tailwind/utils';
import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { RadioItem } from '@/components/ui/radio-group';

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
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const RenderOption = () => {
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
            renderRadio={({ radio, controller: { field } }) => {
              const radioId = `radio-card-${radio.value}`;

              return (
                <label
                  htmlFor={radioId}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:outline-none hover:bg-muted/50',
                    radio.checked
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <RadioItem
                    id={radioId}
                    className="peer sr-only"
                    value={radio.value}
                    disabled={radio.disabled}
                    onBlur={field.onBlur}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{radio.label}</span>
                  </div>
                  <div className="rounded-full bg-primary p-1 opacity-0 peer-data-[state=checked]:opacity-100">
                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                </label>
              );
            }}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
