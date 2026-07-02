import { Meta } from '@storybook/react-vite';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldHelper,
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
  title: 'Form/Form',
} satisfies Meta<typeof Form>;

const zFormSchema = () =>
  z.object({
    name: zu.fieldText.required(),
    other: zu.fieldText.required(),
  });

export const Default = () => {
  const form = useForm({
    schema: zFormSchema(),
    mode: 'blur',
    defaultValues: {
      name: '',
      other: '',
    },
    onSubmit,
  });

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
        <FormField size="lg">
          <FormFieldLabel>Name</FormFieldLabel>
          <FormFieldController form={form} type="text" name="name" />
          <FormFieldHelper>This is an helper text</FormFieldHelper>
        </FormField>
        <FormField>
          <FormFieldLabel>Other (Custom)</FormFieldLabel>
          <FormFieldController
            form={form}
            name="other"
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

export const NoHtmlForm = () => {
  const form = useForm({
    schema: zFormSchema(),
    mode: 'blur',
    defaultValues: {
      name: '',
      other: '',
    },
    onSubmit,
  });

  return (
    <Form form={form} noHtmlForm>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
          <FormField size="lg">
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldController form={form} type="text" name="name" />
            <FormFieldHelper>This is an helper text</FormFieldHelper>
          </FormField>
          <FormField>
            <FormFieldLabel>Other (Custom)</FormFieldLabel>
            <FormFieldController
              form={form}
              name="other"
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
      </form>
    </Form>
  );
};
