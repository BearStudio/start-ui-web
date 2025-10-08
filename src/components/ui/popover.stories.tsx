import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { useDisclosure } from 'react-use-disclosure';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
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
    name: zu.fieldText.required({ error: 'Name is required' }),
  });

export const WithForm = () => {
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
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
        <Form
          {...form}
          onSubmit={(values) => {
            onSubmit(values);
            popover.close();
            form.reset();
          }}
        >
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
      </PopoverContent>
    </Popover>
  );
};
