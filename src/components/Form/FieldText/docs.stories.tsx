import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldText',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), 'Name is required'),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    name: 'Default Name',
  },
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="text"
            name="name"
            label="Name"
            placeholder="Placeholder"
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4}>
          <FormField
            control={form.control}
            type="text"
            name="name"
            label="Name"
            isDisabled
          />
          <Box>
            <Button type="submit" variant="@primary">
              Submit
            </Button>
          </Box>
        </Stack>
      </form>
    </Form>
  );
};
