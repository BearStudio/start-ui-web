import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react-vite';
import { z } from 'zod';

import { useForm } from '@/lib/react-hook-form';
import { zu } from '@/lib/zod/zod-utils';

import { onSubmit } from '@/components/form/docs.utils';
import { Form } from '@/components/new-form';
import { Button } from '@/components/ui/button';
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default {
  title: 'NewForm/Form',
} satisfies Meta<typeof Form>;

const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required(),
    other: zu.fieldText.nullish(),
  });

export const Default = () => {
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(zFormSchema()),
    defaultValues: {
      name: '',
      other: '',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <form.Field
          name="name"
          size="lg"
          children={(field) => (
            <>
              <field.Label>Name</field.Label>
              <field.Text />
              <FieldDescription>This is an helper text</FieldDescription>
            </>
          )}
        />
        <form.Field
          name="other"
          children={({ props, state }) => (
            <>
              <FieldLabel htmlFor={props.name}>Name</FieldLabel>
              <Input
                {...props}
                value={props.value ?? ''}
                id={props.name}
                aria-invalid={state.invalid}
              />
              {state.invalid && <FieldError errors={[state.error]} />}
            </>
          )}
        />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
