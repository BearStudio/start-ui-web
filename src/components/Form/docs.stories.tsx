import { Box, Button, Input, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormFieldController } from '@/components/Form/FormFieldController';
import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField, FormFieldError, FormFieldLabel } from './';

export default {
  title: 'Form/Form',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
    email: zu.string.emailNullish(z.string(), {
      required_error: 'Email is required',
      invalid_type_error: 'Email is invalid',
    }),
    color: z.enum(['red', 'green', 'blue']),
    other: zu.string.nonEmptyNullish(z.string()),
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
    <Form {...form} onSubmit={onSubmit}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController control={form.control} type="text" name="name" />
        </FormField>

        <FormField>
          <FormFieldLabel optionalityHint="optional">Email</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="email"
            name="email"
          />
        </FormField>

        <FormField>
          <FormFieldLabel>Color</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
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
        </FormField>

        <FormField>
          <FormFieldLabel optionalityHint="optional">
            Other (Custom)
          </FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="other"
            type="custom"
            render={({ field }) => (
              <>
                <Input {...field} value={field.value ?? ''} />
                <FormFieldError />
              </>
            )}
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

export const NoHtmlForm = () => {
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
    <Form {...form} noHtmlForm>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormField>
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="text"
              name="name"
            />
          </FormField>

          <FormField>
            <FormFieldLabel optionalityHint="optional">Email</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="email"
              name="email"
            />
          </FormField>

          <FormField>
            <FormFieldLabel>Color</FormFieldLabel>
            <FormFieldController
              control={form.control}
              type="select"
              name="color"
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
          </FormField>

          <FormField>
            <FormFieldLabel optionalityHint="optional">
              Other (Custom)
            </FormFieldLabel>
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              render={({ field }) => (
                <>
                  <Input {...field} value={field.value ?? ''} />
                  <FormFieldError />
                </>
              )}
            />
          </FormField>

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
