import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

import { page, render, setupUser } from '@/tests/utils';

import { zFormFieldsLogin } from './schema';

test('login form translates the schema email-invalid error code at render', async () => {
  const user = setupUser();
  const onSubmit = vi.fn();

  render(
    <FormMocked
      schema={zFormFieldsLogin()}
      useFormOptions={{ defaultValues: { email: '' }, mode: 'onSubmit' }}
      onSubmit={onSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <FormFieldController
            type="email"
            control={form.control}
            name="email"
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = page.getByLabelText('Email');
  await expect.element(input).toBeInTheDocument();
  await user.type(input.element() as HTMLInputElement, 'not-an-email');
  await user.click(page.getByRole('button', { name: 'Submit' }));

  await expect.element(page.getByText('Email is invalid')).toBeInTheDocument();
});

test('login form translates the schema email-required error code at render', async () => {
  const user = setupUser();
  const onSubmit = vi.fn();

  render(
    <FormMocked
      schema={zFormFieldsLogin()}
      useFormOptions={{ defaultValues: { email: '' }, mode: 'onSubmit' }}
      onSubmit={onSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Email</FormFieldLabel>
          <FormFieldController
            type="email"
            control={form.control}
            name="email"
          />
        </FormField>
      )}
    </FormMocked>
  );

  await user.click(page.getByRole('button', { name: 'Submit' }));

  await expect.element(page.getByText('Email is required')).toBeInTheDocument();
});

test('form errors render literal fallback messages that are not translation keys', async () => {
  const user = setupUser();
  const onSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({
        code: z.string().min(1, 'Literal fallback message'),
      })}
      useFormOptions={{ defaultValues: { code: '' }, mode: 'onSubmit' }}
      onSubmit={onSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Code</FormFieldLabel>
          <FormFieldController type="text" control={form.control} name="code" />
        </FormField>
      )}
    </FormMocked>
  );

  await user.click(page.getByRole('button', { name: 'Submit' }));

  await expect
    .element(page.getByText('Literal fallback message'))
    .toBeInTheDocument();
});
