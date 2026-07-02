import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldLabel,
  useForm,
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
  schema: zFormSchema(),
  mode: 'blur',
  defaultValues: {
    website: '',
  },
} as const;

/**
 * Usage inside a custom field render function.
 * FormFieldError automatically accesses the FormFieldController context.
 */
export const CustomField = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website (Custom Field)</FormFieldLabel>
          <FormFieldController
            form={form}
            name="website"
            type="custom"
            render={({ field, fieldState }) => (
              <>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    name={field.name}
                    value={fieldState.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!fieldState.meta.isValid ? true : undefined}
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
 * Pass `form` and `name` props directly to FormFieldError.
 */
export const Standalone = () => {
  const form = useForm({ ...formOptions, onSubmit });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website</FormFieldLabel>
          <FormFieldController
            form={form}
            name="website"
            type="text"
            displayError={false}
          />
        </FormField>
        {/* Error displayed outside of FormFieldController */}
        <FormFieldError form={form} name="website" />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
