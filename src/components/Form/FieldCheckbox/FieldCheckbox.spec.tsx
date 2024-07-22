import { FormLabel } from '@chakra-ui/react';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { render, screen, setupUser } from '@/tests/utils';

import { FormField } from '../FormField';
import { FormFieldController } from '../FormFieldController';
import { FormMocked } from '../form-test-utils';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({
        doit: z.boolean().default(false),
      })}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormLabel>Should I do something?</FormLabel>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="doit"
            label="Yes, do it!"
          />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Should I do something?'));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ doit: true });
});

test('double click', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({
        doit: z.boolean().default(false),
      })}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormLabel>Should I do something?</FormLabel>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="doit"
            label="Yes, do it!"
          />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Should I do something?'));
  await user.click(screen.getByLabelText('Should I do something?'));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ doit: false });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({
        doit: z.boolean().default(false),
      })}
      useFormOptions={{ defaultValues: { doit: true } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormLabel>Should I do something?</FormLabel>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="doit"
            label="Yes, do it!"
          />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Should I do something?'));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ doit: false });
});

test('disabled', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({
        doit: z.boolean().default(false),
      })}
      useFormOptions={{ defaultValues: { doit: false } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormLabel>Should I do something?</FormLabel>
          <FormFieldController
            type="checkbox"
            control={form.control}
            name="doit"
            isDisabled
            label="Yes, do it!"
          />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByLabelText('Should I do something?'));
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ doit: false });
});
