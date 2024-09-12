import { Button, Stack } from '@chakra-ui/react';
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
