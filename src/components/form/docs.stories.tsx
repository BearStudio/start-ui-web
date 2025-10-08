import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default {
  title: 'Form/Form',
} satisfies Meta<typeof Form>;

const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required(),
    other: zu.fieldText.nullish(),
  });

export const Default = () => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      other: '',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField size="lg">
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController control={form.control} type="text" name="name" />
          <FormFieldHelper>This is an helper text</FormFieldHelper>
        </FormField>
        <FormField>
          <FormFieldLabel>Other (Custom)</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="other"
            type="custom"
            render={({ field }) => (
              <>
                <Input {...field} value={field.value ?? ''} />
                <FormFieldError />
              </>
            )}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const NoHtmlForm = () => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      other: '',
    },
  });

  return (
    <Form {...form} noHtmlForm>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <FormField size="lg">
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="text"
              name="name"
            />
            <FormFieldHelper>This is an helper text</FormFieldHelper>
          </FormField>
          <FormField>
            <FormFieldLabel>Other (Custom)</FormFieldLabel>
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              render={({ field }) => (
                <>
                  <Input {...field} value={field.value ?? ''} />
                  <FormFieldError />
                </>
              )}
            />
          </FormField>
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
