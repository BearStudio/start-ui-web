import type { Meta } from '@storybook/react-vite';
import { useUploadFile } from 'better-upload/client';
import { UploadIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
} from '@/components/form';
import { UploadButton } from '@/components/ui/upload-button';

import { BookCover } from '@/features/book/book-cover';

export default {
  title: 'Upload Button',
} satisfies Meta<typeof UploadButton>;

export const Default = () => {
  const { control } = useUploadFile({ route: 'bookCover' });

  return (
    <UploadButton
      control={control}
      inputProps={{
        accept: 'png,jpeg,gif',
      }}
      onChange={(file) => console.log('uploaded file', file)}
    />
  );
};

export const WithChildren = () => {
  const { control } = useUploadFile({ route: 'bookCover' });

  return (
    <div className="flex space-x-2">
      <UploadButton
        control={control}
        onChange={(file) => console.log('uploaded file', file)}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        control={control}
        onChange={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>

      <UploadButton
        control={control}
        onChange={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
      </UploadButton>
    </div>
  );
};

export const Disabled = () => {
  const { control } = useUploadFile({ route: 'bookCover' });

  return (
    <div className="flex space-x-2">
      <UploadButton
        disabled
        control={control}
        onChange={(file) => console.log('uploaded file', file)}
      >
        <UploadIcon />
        Upload a new file
      </UploadButton>

      <UploadButton
        disabled
        control={control}
        onChange={(file) => console.log('uploaded file', file)}
      >
        Upload a new file
        <UploadIcon />
      </UploadButton>
    </div>
  );
};

export const RealWorldUseCase = () => {
  const form = useForm({
    defaultValues: {
      coverId: '',
    },
  });
  const { control, uploadedFile } = useUploadFile({ route: 'bookCover' });

  return (
    <Form {...form}>
      <FormField>
        <FormFieldController
          control={form.control}
          type="custom"
          name="coverId"
          render={() => {
            return (
              <div className="max-w-xs">
                <div className="relative mb-2">
                  <span className="sr-only">Upload cover</span>
                  <BookCover
                    className="opacity-60"
                    book={{
                      title: 'Title',
                      author: 'Author',
                      coverId: uploadedFile?.objectKey,
                    }}
                  />

                  <UploadButton
                    className="absolute top-1/2 left-1/2 -translate-1/2 bg-black/50 text-white"
                    variant="ghost"
                    control={control}
                    disabled={form.formState.isSubmitting}
                  />
                </div>
                <FormFieldError />
              </div>
            );
          }}
        />
      </FormField>
    </Form>
  );
};
