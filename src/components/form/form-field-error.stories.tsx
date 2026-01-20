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
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';

export default {
  title: 'Form/FormFieldError',
};

const zFormSchema = () =>
  z.object({
    website: zu.fieldText.required({ error: 'Website is required' }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    website: '',
  },
} as const;

/**
 * Usage inside a custom field render function.
 * FormFieldError automatically accesses the FormFieldController context.
 */
export const CustomField = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website (Custom Field)</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="website"
            type="custom"
            render={({ field, fieldState }) => (
              <>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    aria-invalid={fieldState.invalid ? true : undefined}
                    value={field.value ?? ''}
                  />
                </InputGroup>
                <FormFieldError />
              </>
            )}
          />
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

/**
 * Standalone usage outside of FormFieldController render function.
 * Pass `control` and `name` props directly to FormFieldError.
 */
export const Standalone = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="website"
            type="text"
            displayError={false}
          />
        </FormField>
        {/* Error displayed outside of FormFieldController */}
        <FormFieldError control={form.control} name="website" />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
