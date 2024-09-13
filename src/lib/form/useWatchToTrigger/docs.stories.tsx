import {
  Button,
  Code,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';
import { getFieldPath } from '@/lib/form/getFieldPath';

import { useWatchToTrigger } from '.';

export default {
  title: 'Hooks/useWatchToTrigger',
};

type FormType = z.infer<ReturnType<typeof formSchema>>;
const formSchema = () =>
  z
    .object({ min: z.number(), default: z.number(), max: z.number() })
    .superRefine((val, ctx) => {
      if (val.min > val.default) {
        ctx.addIssue({
          code: 'custom',
          path: getFieldPath<FormType>('min'),
          message: 'The min should be <= to default',
        });
      }

      if (val.default > val.max) {
        ctx.addIssue({
          code: 'custom',
          path: getFieldPath<FormType>('default'),
          message: 'The default should be <= to the max',
        });
      }
    });

export const WithHook = () => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(formSchema()),
    defaultValues: {
      min: 2,
      default: 4,
      max: 6,
    },
  });

  useWatchToTrigger({ form, names: ['min', 'default', 'max'] });

  return (
    <Form {...form}>
      <Stack>
        <Text>
          This is the story with the hook. You can find the story without the
          hook below. Here is the scenario for maximal reproduction:
        </Text>
        <OrderedList>
          <ListItem>
            Set the <Code>min</Code> to 5
          </ListItem>
          <ListItem>The validation is updated</ListItem>
          <ListItem>
            Set the <Code>default</Code> to 5.5
          </ListItem>
          <ListItem>
            The validation is updated even if the validation is on the{' '}
            <Code>min</Code> field
          </ListItem>
          <ListItem>
            You have to go to the <Code>min</Code> field to trigger the{' '}
            <Code>onBlur</Code> event
          </ListItem>
        </OrderedList>
        <FormField>
          <FormFieldLabel>Min</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="min"
            type="number"
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Default</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="default"
            type="number"
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Max</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="max"
            type="number"
          />
        </FormField>
        <Button type="submit" variant="@primary">
          Submit
        </Button>
      </Stack>
    </Form>
  );
};

export const WithoutHook = () => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(formSchema()),
    defaultValues: {
      min: 2,
      default: 4,
      max: 6,
    },
  });

  return (
    <Form {...form}>
      <Stack>
        <Text>
          This is the story without the hook. Here is the scenario for maximal
          reproduction:
        </Text>
        <OrderedList>
          <ListItem>
            Set the <Code>min</Code> to 5
          </ListItem>
          <ListItem>The validation is updated only on blur</ListItem>
          <ListItem>
            Set the <Code>default</Code> to 5.5
          </ListItem>
          <ListItem>
            The validation is not updated for the <Code>min</Code> field, that
            is because we are in the <Code>default</Code> field. Even the blur
            event will not trigger the validation.
          </ListItem>
        </OrderedList>
        <FormField>
          <FormFieldLabel>Min</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="min"
            type="number"
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Default</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="default"
            type="number"
          />
        </FormField>
        <FormField>
          <FormFieldLabel>Max</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="max"
            type="number"
          />
        </FormField>
        <Button type="submit" variant="@primary">
          Submit
        </Button>
      </Stack>
    </Form>
  );
};
