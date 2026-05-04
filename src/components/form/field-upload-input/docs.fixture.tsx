import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
const zFormSchema = () =>
  z.object({
    file: z.string('Required'),
  });

const formOptions = {
  mode: 'onBlur' as const,
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    file: null!,
  },
};

const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>File</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="upload-input"
            name="file"
            uploadRoute="bookCover"
            onError={() => toast.error('Cannot upload in Cosmos')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      file: 'https://picsum.photos/seed/cosmos/200/200',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>File</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="upload-input"
            name="file"
            uploadRoute="bookCover"
            onError={() => toast.error('Cannot upload in Cosmos')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

const Disabled = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      file: 'https://picsum.photos/seed/cosmos/200/200',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>File</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="upload-input"
            name="file"
            uploadRoute="bookCover"
            disabled
            onError={() => toast.error('Cannot upload in Cosmos')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export default {
  Default,
  DefaultValue,
  Disabled,
};
