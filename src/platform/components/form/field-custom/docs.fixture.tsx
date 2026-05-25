import { z } from 'zod';

import {
  Form,
  FormField,
  FormFieldError,
  FormFieldHelper,
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

/**
 * Demonstrates a custom field rendered directly via `form.AppField` children
 * with `useFieldContext`. This replaces the old `type="custom"` controller
 * pattern.
 */
const Default = () => {
  const form = useAppForm({
    defaultValues: { url: '' },
    validators: { onSubmit: z.object({ url: z.string().min(1) }) },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Website URL</FormFieldLabel>
        <form.AppField name="url">{() => <CustomUrlInput />}</form.AppField>
        <FormFieldHelper>Enter your website URL</FormFieldHelper>
      </FormField>
      <Button type="submit">Submit</Button>
    </Form>
  );
};

const CustomUrlInput = () => {
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
          placeholder="example.com"
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={() => field.handleBlur()}
        />
      </InputGroup>
      <FormFieldError errors={errors} />
    </>
  );
};

export default { Default };
