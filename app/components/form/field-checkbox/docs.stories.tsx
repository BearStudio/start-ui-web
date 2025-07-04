import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react-vite';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/tailwind/utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { FieldCheckbox } from '@/components/form/field-checkbox';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldCheckbox',
  component: FieldCheckbox,
} satisfies Meta<typeof FieldCheckbox>;

const zFormSchema = () =>
  z.object({
    lovesBears: z.boolean().refine((val) => val === true, {
      message: 'Please say you love bears.',
    }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    lovesBears: false,
  },
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
          >
            I love bears
          </FormFieldController>
          <FormFieldHelper>There is only one possible answer.</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      lovesBears: true,
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
          >
            I love bears
          </FormFieldController>
          <FormFieldHelper>There is only one possible answer.</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      lovesBears: true,
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="lovesBears"
            disabled
          >
            I love bears
          </FormFieldController>
          <FormFieldHelper>There is only one possible answer.</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const CustomCheckbox = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldController
            type="checkbox"
            name="lovesBears"
            control={form.control}
            labelProps={{
              className:
                'relative flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors outline-none focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-muted/50 has-[&[data-checked]]:bg-primary/5',
            }}
            render={(props, { checked }) => {
              return (
                <div
                  {...props}
                  className="flex w-full items-center justify-between outline-none"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">I love bears !</span>
                    <FormFieldHelper>
                      There is only one possible answer.
                    </FormFieldHelper>
                  </div>
                  <div
                    className={cn(
                      'aspect-square rounded-full bg-primary p-1 opacity-0',
                      {
                        'opacity-100': checked,
                      }
                    )}
                  >
                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              );
            }}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
