import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController, useForm } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldText',
};

const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required({ error: 'Name is required' }),
  });

const formOptions = {
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {
    name: '',
  },
} as const;

export const Default = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="text"
            form={form}
            name="name"
            placeholder="Buzz Pawdrin"
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
      name: 'Default Name',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            form={form}
            type="text"
            name="name"
            placeholder="Buzz Pawdrin"
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
  const form = useForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            form={form}
            type="text"
            name="name"
            placeholder="Buzz Pawdrin"
            disabled
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
  const form = useForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            form={form}
            type="text"
            name="name"
            placeholder="Buzz Pawdrin"
            readOnly
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
