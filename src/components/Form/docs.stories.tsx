import { Box, Button, Input, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldItem,
  FormFieldLabel,
} from './';

export default {
  title: 'Form/Form',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string()),
    email: zu.string.emailOptional(z.string()),
    color: z.enum(['red', 'green', 'blue']),
    other: zu.string.nonEmptyOptional(z.string()),
  });

export const Default = () => {
  const form = useForm<FormSchema>({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      email: '',
      color: undefined,
      other: '',
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (values) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormField
            type="text"
            name="name"
            control={form.control}
            label="Name"
          />
          <FormField
            type="email"
            name="email"
            control={form.control}
            optionalityHint="optional"
            label="Email"
          />

          <FormField
            type="select"
            name="color"
            control={form.control}
            label="Color"
            options={[
              {
                label: 'Red',
                value: 'red',
              },
              {
                label: 'Green',
                value: 'green',
              },
              {
                label: 'Blue',
                value: 'blue',
              },
            ]}
          />

          <FormField
            control={form.control}
            name="other"
            type="custom"
            optionalityHint="optional"
            render={({ field }) => (
              <FormFieldItem>
                <FormFieldLabel>Other (Custom)</FormFieldLabel>
                <FormFieldControl>
                  <Input {...field} />
                </FormFieldControl>
                <FormFieldError />
              </FormFieldItem>
            )}
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
