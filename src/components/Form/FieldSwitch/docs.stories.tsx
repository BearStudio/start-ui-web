import { Box, Button, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '..';

export default {
  title: 'Form/FieldSwitch',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    doit: z.boolean().default(false),
  });

export const Default = () => {
  const form = useForm<FormSchema>();

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Should I do something?</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="switch"
            name="doit"
            switchProps={{ children: 'Yes, do it!' }}
          />
          <FormFieldHelper>Helper</FormFieldHelper>
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

export const DefaultValues = () => {
  const form = useForm<FormSchema>({
    defaultValues: {
      doit: true,
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Should I do something?</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="switch"
            name="doit"
            switchProps={{ children: 'Yes, do it!' }}
          />
          <FormFieldHelper>Helper</FormFieldHelper>
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
  const form = useForm<FormSchema>();

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Should I do something?</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="switch"
            name="doit"
            switchProps={{ children: 'Yes, do it!' }}
            isDisabled
          />
          <FormFieldHelper>Helper</FormFieldHelper>
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

export const DisabledDefaultValues = () => {
  const form = useForm<FormSchema>({
    defaultValues: {
      doit: true,
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Should I do something?</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="switch"
            name="doit"
            switchProps={{ children: 'Yes, do it!' }}
            isDisabled
          />
          <FormFieldHelper>Helper</FormFieldHelper>
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

export const SwitchProps = () => {
  const form = useForm<FormSchema>();

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <FormFieldLabel>Should I do something?</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="switch"
            name="doit"
            switchProps={{ children: 'Yes, do it!', colorScheme: 'purple' }}
          />
          <FormFieldHelper>Helper</FormFieldHelper>
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
