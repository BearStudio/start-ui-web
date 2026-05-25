import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { Button } from '@/platform/components/ui/button';

const Default = () => {
  const form = useAppForm({
    defaultValues: { file: '' as string | null },
    validators: { onSubmit: z.object({ file: z.string().nullable() }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>File</FormFieldLabel>
        <form.AppField name="file">
          {(field) => (
            <field.FieldUploadInput
              uploadRoute="bookCover"
              onError={() => toast.error('Upload failed')}
            />
          )}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default { Default };
