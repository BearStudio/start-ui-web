import { Box, Button, Flex, Input, Stack, Text } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldLabel,
} from '../';

export default {
  title: 'Form/FieldCustom',
};

type FormSchema = z.infer<ReturnType<typeof zFormSchema>>;
const zFormSchema = () =>
  z.object({
    other: zu.string.nonEmpty(z.string()).length(8),
  });

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
          <Flex align="center" gap={4}>
            <FormFieldLabel>Label</FormFieldLabel>
            <Text color="text-dimmed" fontSize="sm">
              Before
            </Text>
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              render={({ field }) => (
                <>
                  <Input w={24} size="sm" {...field} />
                  <FormFieldError />
                </>
              )}
            />
            <Text color="text-dimmed" fontSize="sm">
              After
            </Text>
          </Flex>
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
      other: '12345678',
    },
  });

  return (
    <Form {...form} onSubmit={(values) => console.log(values)}>
      <Stack spacing={4}>
        <FormField>
          <Flex align="center" gap={4}>
            <FormFieldLabel>Label</FormFieldLabel>
            <Text color="text-dimmed" fontSize="sm">
              Before
            </Text>
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              render={({ field }) => (
                <>
                  <Input w={24} size="sm" {...field} />
                  <FormFieldError />
                </>
              )}
            />
            <Text color="text-dimmed" fontSize="sm">
              After
            </Text>
          </Flex>
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
          <Flex align="center" gap={4}>
            <FormFieldLabel>Label</FormFieldLabel>
            <Text color="text-dimmed" fontSize="sm">
              Before
            </Text>
            <FormFieldController
              control={form.control}
              name="other"
              type="custom"
              render={({ field }) => (
                <>
                  <Input isDisabled w={24} size="sm" {...field} />
                  <FormFieldError />
                </>
              )}
            />
            <Text color="text-dimmed" fontSize="sm">
              After
            </Text>
          </Flex>
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
