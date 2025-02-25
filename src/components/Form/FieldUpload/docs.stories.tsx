import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zFieldUploadValue } from '@/files/schemas';

import { Form, FormField, FormFieldController, FormFieldLabel } from '../';
import { FieldUploadPreview } from './FieldUploadPreview';
import { useFieldUploadFileFromUrl } from './utils';

export default {
  title: 'Form/FieldUpload',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    file: zFieldUploadValue().optional(),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm<FormSchema>({
    defaultValues: {
      file: undefined,
    },
    ...formOptions,
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="upload"
            name="file"
            control={form.control}
          />
        </FormField>
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};

export const WithDefaultValue = () => {
  const initialFile = useFieldUploadFileFromUrl(
    'https://plus.unsplash.com/premium_photo-1674593231084-d8b27596b134?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8'
  );

  const form = useForm<FormSchema>({
    values: {
      file: initialFile.data,
    },
    ...formOptions,
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="upload"
            name="file"
            control={form.control}
          />
        </FormField>
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};

export const WithPreview = () => {
  const initialFile = useFieldUploadFileFromUrl(
    'https://plus.unsplash.com/premium_photo-1674593231084-d8b27596b134?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwyfHx8ZW58MHx8fHx8'
  );

  const form = useForm<FormSchema>({
    values: {
      file: initialFile.data,
    },
    ...formOptions,
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController
            type="upload"
            name="file"
            control={form.control}
          />
        </FormField>
        <FieldUploadPreview uploaderName="file" />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};
