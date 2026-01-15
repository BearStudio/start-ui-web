import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldHelper,
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
  title: 'Form/FieldCustom',
};

const zFormSchema = () =>
  z.object({
    url: zu.fieldText.required({ error: 'URL is required' }),
  });

const formOptions = {
  mode: 'onBlur',
  resolver: zodResolver(zFormSchema()),
  defaultValues: {
    url: '',
  },
} as const;

export const Default = () => {
  const form = useForm(formOptions);

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website URL</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="url"
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
                    placeholder="example.com"
                  />
                </InputGroup>
                <FormFieldError />
              </>
            )}
          />
          <FormFieldHelper>Enter your website URL</FormFieldHelper>
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
      url: 'example.com',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website URL</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="url"
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
                    placeholder="example.com"
                  />
                </InputGroup>
                <FormFieldError />
              </>
            )}
          />
          <FormFieldHelper>Enter your website URL</FormFieldHelper>
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
      url: 'example.com',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website URL</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="url"
            type="custom"
            disabled
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
                    placeholder="example.com"
                    disabled
                  />
                </InputGroup>
                <FormFieldError />
              </>
            )}
          />
          <FormFieldHelper>Enter your website URL</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};

export const ReadOnly = () => {
  const form = useForm({
    ...formOptions,
    defaultValues: {
      url: 'example.com',
    },
  });

  return (
    <Form {...form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <FormField>
          <FormFieldLabel>Website URL</FormFieldLabel>
          <FormFieldController
            control={form.control}
            name="url"
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
                    placeholder="example.com"
                    readOnly
                  />
                </InputGroup>
                <FormFieldError />
              </>
            )}
          />
          <FormFieldHelper>Enter your website URL</FormFieldHelper>
        </FormField>
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </div>
    </Form>
  );
};
