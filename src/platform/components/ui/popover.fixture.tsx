import { useDisclosure } from 'react-use-disclosure';
import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldHelper,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';
import { Input } from '@/platform/components/ui/input';
import { Label } from '@/platform/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/platform/components/ui/popover';
const Default = () => {
  return (
    <Popover>
      <PopoverTrigger render={<Button />}>Click me</PopoverTrigger>
      <PopoverContent>The content</PopoverContent>
    </Popover>
  );
};

const Controlled = () => {
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

const WithForm = () => {
  const popover = useDisclosure();
  const form = useAppForm({
    defaultValues: { name: '' },
    validators: { onSubmit: zFormSchema() },
    onSubmit: ({ value }) => {
      onSubmit(value);
      popover.close();
      form.reset();
    },
  });

  return (
    <Popover
      onOpenChange={(open) => {
        popover.toggle(open);
        if (!open) {
          setTimeout(() => form.reset());
        }
      }}
      open={popover.isOpen}
    >
      <PopoverTrigger render={<Button />}>Info</PopoverTrigger>
      <PopoverContent>
        <Form form={form}>
          <div className="flex flex-col gap-4">
            <FormField>
              <FormFieldLabel>Name</FormFieldLabel>
              <form.AppField name="name">
                {(field) => (
                  <field.FieldText type="text" placeholder="Buzz Pawdrin" />
                )}
              </form.AppField>
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

const WithHeaderAndDescription = () => {
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

const Placements = () => {
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

export default {
  Default,
  Controlled,
  WithForm,
  WithHeaderAndDescription,
  Placements,
};
