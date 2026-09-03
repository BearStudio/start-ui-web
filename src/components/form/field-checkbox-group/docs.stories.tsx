import { z } from 'zod';

import { FormFieldController, useForm } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldCheckboxGroup',
};

const zFormSchema = () =>
  z.object({
    bears: z
      .array(z.string(), 'Required')
      .nonempty('Select at least one answer.'),
  });

const formOptions = {
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {
    bears: [],
  } as z.infer<ReturnType<typeof zFormSchema>>,
} as const;

const options = [
  { value: 'bearstrong', label: 'Bearstrong' },
  { value: 'pawdrin', label: 'Buzz Pawdrin' },
  { value: 'grizzlyrin', label: 'Yuri Grizzlyrin' },
];

export const Default = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            type="checkbox-group"
            form={form}
            name="bears"
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
      bears: ['pawdrin'],
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            form={form}
            type="checkbox-group"
            name="bears"
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
      bears: ['pawdrin'],
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            form={form}
            type="checkbox-group"
            name="bears"
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
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            form={form}
            type="checkbox-group"
            name="bears"
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
  const form = useForm({ ...formOptions, onSubmit });

  const optionsWithDisabled = [
    { value: 'bearstrong', label: 'Bearstrong' },
    { value: 'pawdrin', label: 'Buzz Pawdrin' },
    { value: 'grizzlyrin', label: 'Yuri Grizzlyrin', disabled: true },
  ];

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldHelper>Select your favorite bearstronaut</FormFieldHelper>
          <FormFieldController
            form={form}
            type="checkbox-group"
            name="bears"
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
