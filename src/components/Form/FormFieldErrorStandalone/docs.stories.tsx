import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  SlideFade,
  Stack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField } from '../';
import { FormFieldErrorStandalone } from './';

export default {
  title: 'Form/FormFieldErrorStandalone',
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
          helper="Render the error anywhere"
          displayError={false}
        />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
        <FormFieldErrorStandalone control={form.control} name="name" />
      </Stack>
    </Form>
  );
};

export const CustomRendering = () => {
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
          helper="Render the error anywhere with custom rendering"
          displayError={false}
        />
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>

        <FormFieldErrorStandalone control={form.control} name="name">
          {({ error }) => (
            <SlideFade in offsetY={-6}>
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>{error?.message}</AlertTitle>
              </Alert>
            </SlideFade>
          )}
        </FormFieldErrorStandalone>
      </Stack>
    </Form>
  );
};
