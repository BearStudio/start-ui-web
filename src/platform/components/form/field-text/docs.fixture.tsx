import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import { FormFieldController } from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

import { Form, FormField, FormFieldHelper, FormFieldLabel } from '../';
const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required({ error: 'Name is required' }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    name: '',
  },
} as const;

const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="text"
            control={form.control}
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

const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Name',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            control={form.control}
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

const Disabled = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            control={form.control}
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

const ReadOnly = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      name: 'Default Value',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            control={form.control}
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

export default {
  Default,
  DefaultValue,
  Disabled,
  ReadOnly,
};
