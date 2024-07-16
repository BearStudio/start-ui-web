import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuActivity } from 'react-icons/lu';
import { z } from 'zod';

import { Icon } from '@/components/Icons';
import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldText',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    name: '',
  },
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
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
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm<FormSchema>({
    ...formOptions,
    defaultValues: {
      name: 'Default Name',
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="text"
          name="name"
          label="Name"
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
    </Form>
  );
};

export const StartElement = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="text"
          name="name"
          label="Name"
          placeholder="Placeholder"
          startElement={<Icon icon={LuActivity} />}
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

export const ChakraProps = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="text"
          name="name"
          label="Name"
          placeholder="Buzz Pawdrin"
          inputProps={{
            variant: 'filled',
          }}
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
