import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldOtp',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    code: zu.string.nonEmpty(
      z.string().min(6, 'Code is 6 digits').max(6, 'Code is 6 digits'),
      'Code is required'
    ),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4} maxW="20rem">
          <FormField
            control={form.control}
            type="otp"
            name="code"
            label="Code"
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

export const DefaultValue = () => {
  const form = useForm<FormSchema>({
    ...formOptions,
    defaultValues: {
      code: '927342',
    },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4} maxW="20rem">
          <FormField
            control={form.control}
            type="otp"
            name="code"
            label="Code"
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
        <Stack spacing={4} maxW="20rem">
          <FormField
            control={form.control}
            type="otp"
            name="code"
            label="Code"
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

export const CustomLength = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => console.log(values))}
      >
        <Stack spacing={4} maxW="12rem">
          <FormField
            control={form.control}
            type="otp"
            name="code"
            label="Code"
            length={4}
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
