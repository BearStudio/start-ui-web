import { Box, Button, Checkbox, SimpleGrid, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { Form, FormField, FormFieldController, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldCheckboxes',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    colors: zu.array.nonEmpty(z.enum(['red', 'green', 'blue']).array()),
  });

const options = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
] as const;

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
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

export const DefaultValue = () => {
  const form = useForm<FormSchema>({
    ...formOptions,
    defaultValues: {
      colors: ['red'],
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
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

export const Disabled = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
            isDisabled
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

type FormSchemaOptional = z.infer<ReturnType<typeof zFormSchemaOptional>>;
const zFormSchemaOptional = () =>
  z.object({
    colors: zu.array.nonEmptyNullish(z.enum(['red', 'green', 'blue']).array()),
  });

export const Optional = () => {
  const form = useForm<FormSchemaOptional>({
    ...formOptions,
    resolver: zodResolver(zFormSchemaOptional()),
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel optionalityHint="optional">Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
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

export const Row = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
            direction="row"
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

export const CustomLayout = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
          >
            {' '}
            <SimpleGrid columns={3}>
              {options.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </SimpleGrid>
          </FormFieldController>
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

export const ChakraProps = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="checkboxes"
            name="colors"
            options={options}
            checkboxGroupProps={{ colorScheme: 'cyan' }}
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
