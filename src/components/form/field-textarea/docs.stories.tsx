import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { FormFieldController, useForm } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldTextarea',
};

const zFormSchema = () =>
  z.object({
    description: zu.fieldText.required({ error: 'Description is required' }),
  });

const formOptions = {
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {
    description: '',
  },
} as const;

export const Default = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Description</FormFieldLabel>
          <FormFieldController
            type="textarea"
            form={form}
            name="description"
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
      description: 'Default description',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Description</FormFieldLabel>
          <FormFieldController
            form={form}
            type="textarea"
            name="description"
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
      description: 'Default Value',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Description</FormFieldLabel>
          <FormFieldController
            form={form}
            type="textarea"
            name="description"
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
      description: 'Default Value',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Description</FormFieldLabel>
          <FormFieldController
            form={form}
            type="textarea"
            name="description"
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
