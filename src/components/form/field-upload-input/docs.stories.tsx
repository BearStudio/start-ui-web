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
import { type UploadInputDefaultValue } from '@/components/upload/upload-input';

export default {
  title: 'Form/FieldUploadInput',
};

const zUploadValue = () =>
  z.object(
    {
      name: z.string(),
      url: z.string().optional(),
    },
    'File is required'
  );

type FormValues = {
  file: UploadInputDefaultValue | null;
};

const zFormSchema = () =>
  z.object({
    file: zUploadValue(),
  });

const formOptions = {
  mode: 'onBlur' as const,
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    file: null!,
  } satisfies FormValues,
};

export const Default = () => {
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
            onError={() => toast.error('Cannot upload in storybook')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      file: {
        name: 'cover.jpg',
        url: 'https://picsum.photos/seed/storybook/200/200',
      },
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
            onError={() => toast.error('Cannot upload in storybook')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      file: {
        name: 'cover.jpg',
        url: 'https://picsum.photos/seed/storybook/200/200',
      },
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
            onError={() => toast.error('Cannot upload in storybook')}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
