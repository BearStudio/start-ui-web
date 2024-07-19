import dayjs from 'dayjs';
import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/Form/form-test-utils';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField, FormFieldController, FormFieldLabel } from '..';

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ date: z.date() })}
      useFormOptions={{ defaultValues: { date: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Date</FormFieldLabel>
          <FormFieldController type="date" control={form.control} name="date" />
        </FormField>
      )}
    </FormMocked>
  );
  const input = screen.getByLabelText('Date');
  await user.type(input, '01/01/2000');
  await user.tab();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({
    date: dayjs('01/01/2000').toDate(),
  });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(
    <FormMocked
      schema={z.object({ date: z.date() })}
      useFormOptions={{
        defaultValues: {
          date: dayjs('01/01/2000').toDate(),
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Date</FormFieldLabel>
          <FormFieldController type="date" control={form.control} name="date" />
        </FormField>
      )}
    </FormMocked>
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({
    date: dayjs('01/01/2000').toDate(),
  });
});
