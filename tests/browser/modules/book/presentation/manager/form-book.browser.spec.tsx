import { expect, test, vi } from 'vitest';

import { FormField, FormFieldLabel } from '@/platform/components/form';
import { FormMocked } from '@/platform/components/form/form-test-utils';

import { page, render, setupUser } from '@tests/utils';

import { zFormFieldsBook } from '@/modules/book/presentation/schema';

test('book form translates the schema title-required error code at render', async () => {
  const user = setupUser();
  const onSubmit = vi.fn();

  render(
    <FormMocked
      schema={zFormFieldsBook()}
      defaultValues={{
        title: '',
        author: 'a',
        publisher: undefined,
        coverId: undefined,
        genreId: 'g',
      }}
      onSubmit={onSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>Title</FormFieldLabel>
          <form.AppField name="title">
            {(field) => <field.FieldText type="text" />}
          </form.AppField>
        </FormField>
      )}
    </FormMocked>
  );

  await user.click(page.getByRole('button', { name: 'Submit' }));

  await expect.element(page.getByText('Title is required')).toBeInTheDocument();
});
