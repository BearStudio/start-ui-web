import { z } from 'zod';

import { zu } from '@/platform/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldError,
  FormFieldLabel,
  useAppForm,
} from '@/platform/components/form';
import { onSubmit } from '@/platform/components/form/docs.utils';
import { useFieldContext } from '@/platform/components/form/use-app-form-contexts';
import { Button } from '@/platform/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/platform/components/ui/input-group';

const zFormSchema = () =>
  z.object({
    website: zu.fieldText.required({ error: 'Website is required' }),
  });

/**
 * Custom field that renders its own error via `FormFieldError`.
 */
const CustomField = () => {
  const form = useAppForm({
    defaultValues: { website: '' },
    validators: { onSubmit: zFormSchema() },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Website (Custom Field)</FormFieldLabel>
        <form.AppField name="website">
          {() => <CustomWebsiteInput />}
        </form.AppField>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

const CustomWebsiteInput = () => {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;
  const invalid = errors.length > 0 && field.state.meta.isTouched;
  return (
    <>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          value={field.state.value ?? ''}
          aria-invalid={invalid || undefined}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={() => field.handleBlur()}
        />
      </InputGroup>
      <FormFieldError errors={errors} />
    </>
  );
};

export default { CustomField };
