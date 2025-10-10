import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/tailwind/utils';
import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { Radio } from '@/components/ui/radio-group';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldRadioGroup',
};

const zFormSchema = () =>
  z.object({
    bear: zu.fieldText.required({
      error: 'Please select your favorite bearstronaut',
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
            className="flex-row gap-6"
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

export const WithCustomRadio = () => {
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
            renderOption={({ label, ...props }) => {
              return (
                <Radio
                  {...props}
                  labelProps={{
                    className:
                      'relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors outline-none focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-muted/50 has-[:checked]:border-transparent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground',
                  }}
                  render={(props, { checked }) => {
                    return (
                      <button
                        type="button"
                        {...props}
                        className="flex w-full items-center justify-between outline-none"
                      >
                        <span className="font-medium">{label}</span>
                        <span
                          className={cn(
                            'rounded-full bg-primary-foreground p-1 opacity-0',
                            {
                              'opacity-100': checked,
                            }
                          )}
                        >
                          <CheckIcon className="size-4 text-primary" />
                        </span>
                      </button>
                    );
                  }}
                />
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
