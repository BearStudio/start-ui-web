import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { FormFieldController } from '@/components/Form/FormFieldController';
import { FormFieldLabel } from '@/components/Form/FormFieldLabel';
import { FieldUploadValue, zFieldUploadValue } from '@/files/schemas';
import { render, screen, setupUser } from '@/tests/utils';

import { FormField } from '../FormField';
import { FormMocked } from '../form-test-utils';

const mockFileRaw = new File(['mock-contet'], 'FileTest', {
  type: 'image/png',
});

const mockFile: FieldUploadValue = {
  file: mockFileRaw,
  lastModified: mockFileRaw.lastModified,
  lastModifiedDate: new Date(mockFileRaw.lastModified),
  size: mockFileRaw.size.toString(),
  type: mockFileRaw.type,
  name: mockFileRaw.name ?? '',
};

test('update value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ file: zFieldUploadValue().optional() })}
      useFormOptions={{ defaultValues: { file: undefined } }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>File</FormFieldLabel>
          <FormFieldController
            type="upload"
            name="file"
            control={form.control}
            inputText="Upload"
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = screen.getByLabelText<HTMLInputElement>('Upload');
  await user.upload(input, mockFile.file ?? []);
  expect(input.files ? input.files[0] : []).toBe(mockFile.file);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ file: mockFile });
});

test('default value', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  render(
    <FormMocked
      schema={z.object({ file: zFieldUploadValue().optional() })}
      useFormOptions={{
        values: {
          file: mockFile,
        },
      }}
      onSubmit={mockedSubmit}
    >
      {({ form }) => (
        <FormField>
          <FormFieldLabel>File</FormFieldLabel>
          <FormFieldController
            type="upload"
            name="file"
            control={form.control}
          />
        </FormField>
      )}
    </FormMocked>
  );

  const input = screen.getByLabelText<HTMLInputElement>(mockFile.name ?? '');
  expect(input.files ? input.files[0] : []).toBe(undefined);
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(mockedSubmit).toHaveBeenCalledWith({ file: mockFile });
});
