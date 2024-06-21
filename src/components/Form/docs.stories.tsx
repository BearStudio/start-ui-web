import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
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
    name: zu.string.nonEmpty(z.string(), {
      required_error: 'Name is required',
    }),
    email: zu.string.emailOptional(z.string(), {
      required_error: 'Email is required',
      invalid_type_error: 'Email is invalid',
    }),
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
    <Form {...form} onSubmit={onSubmit}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="text"
          name="name"
          label="Name"
        />

        <FormField
          control={form.control}
          type="email"
          name="email"
          optionalityHint="optional"
          label="Email"
        />

        <FormField
          control={form.control}
          type="select"
          name="color"
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
              <Input {...field} />
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
    </Form>
  );
};

export const RowLayoutFields = () => {
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
      <SimpleGrid gap={4} columns={1}>
        <FormField
          layout="row"
          rowLabelWidth="12rem"
          size="sm"
          control={form.control}
          type="text"
          name="name"
          label="Name"
        />

        <FormField
          layout="row"
          rowLabelWidth="12rem"
          size="sm"
          control={form.control}
          type="email"
          name="email"
          optionalityHint="optional"
          label="Email"
        />

        <FormField
          layout="row"
          rowLabelWidth="12rem"
          size="sm"
          control={form.control}
          type="select"
          name="color"
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
          layout="row"
          rowLabelWidth="12rem"
          size="sm"
          control={form.control}
          name="other"
          type="custom"
          optionalityHint="optional"
          render={({ field }) => (
            <FormFieldItem>
              <FormFieldLabel>Other (Custom)</FormFieldLabel>
              <Input size="sm" {...field} />
              <FormFieldError />
            </FormFieldItem>
          )}
        />

        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </SimpleGrid>
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
          <FormField
            control={form.control}
            type="text"
            name="name"
            label="Name"
          />

          <FormField
            control={form.control}
            type="email"
            name="email"
            optionalityHint="optional"
            label="Email"
          />

          <FormField
            control={form.control}
            type="select"
            name="color"
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
                <Input {...field} />
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

type FormArraySchema = z.infer<ReturnType<typeof zFormArraySchema>>;
const zFormArraySchema = () =>
  z.object({
    users: z
      .array(
        z.object({
          firstName: zu.string.nonEmpty(z.string()),
          lastName: zu.string.nonEmptyOptional(z.string()),
        })
      )
      .min(1)
      .max(3),
  });

export const Array = () => {
  const form = useForm<FormArraySchema>({
    mode: 'onBlur',
    resolver: zodResolver(zFormArraySchema()),
    defaultValues: {
      users: [{ firstName: 'Jane', lastName: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'users',
  });
  const { error: usersError } = form.getFieldState('users');

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        {fields.map((field, index) => (
          <Flex gap={4} key={field.id}>
            <FormField
              control={form.control}
              type="text"
              label="First Name"
              name={`users.${index}.firstName`}
            />
            <FormField
              control={form.control}
              type="text"
              label="Last Name"
              name={`users.${index}.lastName`}
              optionalityHint="optional"
            />
            <IconButton
              aria-label="Remove"
              mt={7}
              icon={<LuTrash2 />}
              onClick={() => remove(index)}
            />
          </Flex>
        ))}
        {!!usersError?.message && (
          <Alert status="warning">
            <AlertIcon />
            <AlertDescription>{usersError?.message}</AlertDescription>
          </Alert>
        )}
        {fields.length < 3 && (
          <Button
            bg="gray.50"
            border="1px dashed"
            borderColor="gray.300"
            boxShadow="none"
            leftIcon={<LuPlus />}
            onClick={() => append({ firstName: '', lastName: '' })}
          >
            Add user
          </Button>
        )}
        <Box>
          <Button type="submit" variant="@primary">
            Submit
          </Button>
        </Box>
      </Stack>
    </Form>
  );
};
