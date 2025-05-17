import type { Meta } from '@storybook/react';
import { useDisclosure } from 'react-use-disclosure';
import { z } from 'zod';

import { useAppForm } from '@/lib/form/config';
import { zu } from '@/lib/zod/zod-utils';

import { Form } from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'Popover',
} satisfies Meta<typeof Popover>;

export const Default = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Click me</Button>
      </PopoverTrigger>
      <PopoverContent>The content</PopoverContent>
    </Popover>
  );
};

export const Controlled = () => {
  const popover = useDisclosure();

  return (
    <div className="flex gap-8">
      <Popover
        open={popover.isOpen}
        onOpenChange={(open) => popover.toggle(open)}
      >
        <PopoverTrigger>The popover will mount here</PopoverTrigger>
        <PopoverContent>The content</PopoverContent>
      </Popover>

      <Button variant="secondary" onClick={() => popover.open()}>
        Open the popover
      </Button>
    </div>
  );
};

const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
  });

export const WithForm = () => {
  const form = useAppForm({
    validators: { onSubmit: zFormSchema() },
    defaultValues: {
      name: '',
    },
    onSubmit: (values) => {
      onSubmit(values);
      popover.close();
      form.reset();
    },
  });
  const popover = useDisclosure();

  return (
    <Popover
      onOpenChange={(open) => {
        popover.toggle(open);
        if (!open) {
          // Using setTimeout to prioritize the closing of the popover instead
          // of the reset. We are resetting because a required input should reset
          // itself in a popover
          setTimeout(() => {
            form.reset();
          });
        }
      }}
      open={popover.isOpen}
    >
      <PopoverTrigger asChild>
        <Button>Info</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Form form={form}>
          <div className="flex flex-col gap-4">
            <form.AppField name="name">
              {(field) => (
                <field.FormField>
                  <field.FormFieldLabel>Name</field.FormFieldLabel>
                  <field.FieldText placeholder="Buzz Pawdrin" />
                  <field.FormFieldHelper>Help</field.FormFieldHelper>
                </field.FormField>
              )}
            </form.AppField>

            <div>
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
};
