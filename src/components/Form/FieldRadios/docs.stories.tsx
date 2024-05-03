import { Box, Button, Radio, SimpleGrid, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormField } from '../';

export default {
  title: 'Form/FieldRadios',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    color: z.enum(['red', 'green', 'blue']),
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
        <FormField
          control={form.control}
          type="radios"
          name="color"
          label="Color"
          options={options}
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
      color: 'red',
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="radios"
          name="color"
          label="Color"
          options={options}
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
          type="radios"
          name="color"
          label="Color"
          options={options}
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

type FormSchemaOptional = z.infer<ReturnType<typeof zFormSchemaOptional>>;
const zFormSchemaOptional = () =>
  z.object({
    color: z.enum(['red', 'green', 'blue']).optional(),
  });

export const Optional = () => {
  const form = useForm<FormSchemaOptional>({
    ...formOptions,
    resolver: zodResolver(zFormSchemaOptional()),
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="radios"
          name="color"
          label="Color"
          optionalityHint="optional"
          options={options}
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

export const Row = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="radios"
          name="color"
          label="Color"
          direction="row"
          options={options}
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

export const CustomLayout = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField
          control={form.control}
          type="radios"
          name="color"
          label="Color"
        >
          <SimpleGrid columns={3}>
            {options.map((option) => (
              <Radio key={option.value} value={option.value}>
                {option.label}
              </Radio>
            ))}
          </SimpleGrid>
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
