import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';

export default {
  title: 'Form/FieldComboboxMultiple',
};

const zFormSchema = () =>
  z.object({
    bear: z
      .array(z.enum(['1', '2', '3', '4', '5', '6']), { error: 'Required' })
      .min(1, { error: 'Required' }),
  });

const options = [
  {
    id: '1',
    name: 'Bearstrong',
  },
  {
    id: '2',
    name: 'Buzz Pawdrin',
  },
  {
    id: '3',
    name: 'Yuri Grizzlyrin',
  },
  {
    id: '4',
    name: 'Mae Jemibear',
    disabled: true,
  },
  {
    id: '5',
    name: 'Sally Ridepaw',
  },
  {
    id: '6',
    name: 'Michael Paw Anderson',
  },
] satisfies {
  id: string;
  name: string;
  disabled?: boolean;
}[];

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="combobox-multiple"
            name="bear"
            placeholder="Placeholder"
            showClear
            items={options.map((item) => ({
              value: item.id,
              label: item.name,
              disabled: item.disabled,
            }))}
          />
        </FormField>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const DefaultValue = () => {
  const form = useForm<z.infer<ReturnType<typeof zFormSchema>>>({
    ...formOptions,
    defaultValues: {
      bear: ['1'],
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="combobox-multiple"
            name="bear"
            placeholder="Placeholder"
            showClear
            items={options.map((item) => ({
              value: item.id,
              label: item.name,
              disabled: item.disabled,
            }))}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};

export const Disabled = () => {
  const form = useForm<z.infer<ReturnType<typeof zFormSchema>>>({
    ...formOptions,
    defaultValues: {
      bear: ['1'],
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Bearstronaut</FormFieldLabel>
          <FormFieldController
            control={form.control}
            type="combobox-multiple"
            name="bear"
            placeholder="Placeholder"
            disabled
            items={options.map((item) => ({
              value: item.id,
              label: item.name,
              disabled: item.disabled,
            }))}
          />
        </FormField>

        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
