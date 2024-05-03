import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldPassword',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    password: zu.string.nonEmpty(z.string(), {
      required_error: 'Password is required',
    }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    password: '',
  },
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="password"
          name="password"
          label="Password"
          placeholder="Placeholder"
        />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="password"
          name="password"
          label="Password"
          isDisabled
        />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};
