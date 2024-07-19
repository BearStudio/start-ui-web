import { Box, Button, Stack } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormField, FormFieldController, FormFieldLabel } from '../';

export default {
  title: 'Form/FieldSelect',
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
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
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
      color: 'red',
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
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
            type="select"
            name="color"
            placeholder="Placeholder"
            isDisabled
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

export const ChakraProps = () => {
  const form = useForm<FormSchema>(formOptions);

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Colors</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="select"
            name="color"
            placeholder="Placeholder"
            options={options}
            selectProps={{
              chakraStyles: {
                control: (provided) => ({
                  ...provided,
                  backgroundColor: `${form.watch('color')}.100`,
                }),
              },
            }}
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
