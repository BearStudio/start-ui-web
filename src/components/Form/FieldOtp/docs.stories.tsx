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
const zFormSchema = (options: { length?: number } = {}) => {
  const length = options.length ?? 6;
  return z.object({
    code: zu.string.nonEmpty(
      z
        .string()
        .min(length, `Code is ${length} digits`)
        .max(length, `Code is ${length} digits`),
      {
        required_error: 'Code is required',
      }
    ),
  });
};

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4} maxW="20rem">
        <FormField control={form.control} type="otp" name="code" label="Code" />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
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
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4} maxW="20rem">
        <FormField control={form.control} type="otp" name="code" label="Code" />
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
    </Form>
  );
};

export const CustomLength = () => {
  const form = useForm<FormSchema>({
    ...formOptions,
    resolver: zodResolver(zFormSchema({ length: 4 })),
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
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
    </Form>
  );
};

export const AutoSubmit = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4} maxW="20rem">
        <FormField
          control={form.control}
          type="otp"
          name="code"
          label="Code"
          autoSubmit
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
