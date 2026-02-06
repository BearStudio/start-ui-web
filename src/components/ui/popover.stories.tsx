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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

export default {
  title: 'Popover',
} satisfies Meta<typeof Popover>;

export const Default = () => {
  return (
    <Popover>
      <PopoverTrigger render={<Button />}>Click me</PopoverTrigger>
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
      <PopoverTrigger render={<Button />}>Info</PopoverTrigger>
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

export const WithHeaderAndDescription = () => {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        Open popover
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="width">Width</Label>
            <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="maxWidth">Max. width</Label>
            <Input
              id="maxWidth"
              defaultValue="300px"
              className="col-span-2 h-8"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="height">Height</Label>
            <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="maxHeight">Max. height</Label>
            <Input
              id="maxHeight"
              defaultValue="none"
              className="col-span-2 h-8"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const Placements = () => {
  return (
    <div className="flex min-h-[300px] items-center justify-center gap-4">
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          Top
        </PopoverTrigger>
        <PopoverContent side="top">Popover on top</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          Right
        </PopoverTrigger>
        <PopoverContent side="right">Popover on right</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          Bottom
        </PopoverTrigger>
        <PopoverContent side="bottom">Popover on bottom</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          Left
        </PopoverTrigger>
        <PopoverContent side="left">Popover on left</PopoverContent>
      </Popover>
    </div>
  );
};
