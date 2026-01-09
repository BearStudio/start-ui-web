import { zodResolver } from '@hookform/resolvers/zod';
import { Meta } from '@storybook/react-vite';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import { onSubmit } from '@/components/form/docs.utils';
import { Form } from '@/components/new-form';
import { useAppForm } from '@/components/new-form/hooks';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
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
  const form = useAppForm({
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
        <form.Controller
          name="name"
          size="lg"
          render={(field) => (
            <>
              <field.Label>Name</field.Label>
              <field.Text />
              <field.Description>This is an helper text</field.Description>
            </>
          )}
        />
        <form.Controller
          name="other"
          render={(field) => (
            <>
              <field.Label htmlFor={field.props.name}>Name</field.Label>
              <Input
                {...field.props}
                value={field.props.value ?? ''}
                id={field.props.name}
                aria-invalid={field.state.invalid}
              />
              {field.state.invalid && (
                <FieldError errors={[field.state.error]} />
              )}
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
