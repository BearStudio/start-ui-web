import { expect, test } from 'vitest';
import { z } from 'zod';

import { FormMocked } from '@/components/form/form-test-utils';

import { FormBook } from '@/features/book/manager/form-book';
import { page, render, setupUser } from '@/tests/utils';

const genres = Array.from({ length: 125 }, (_, index) => ({
  id: `genre-${index + 1}`,
  name: `Genre ${index + 1}`,
  color: '#112233',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const formSchema = z.object({
  title: z.string(),
  author: z.string(),
  genreId: z.string(),
  publisher: z.string(),
  coverId: z.string(),
});

test('shows and allows selecting genres beyond the first loaded page', async () => {
  const user = setupUser();

  render(
    <FormMocked
      schema={formSchema}
      useFormOptions={{
        defaultValues: {
          title: 'Example title',
          author: 'Example author',
          genreId: 'genre-125',
          publisher: '',
          coverId: '',
        },
      }}
    >
      {() => <FormBook genres={genres} />}
    </FormMocked>
  );

  const input = page.getByRole('combobox', { name: 'Genre' });
  const inputElement = input.element() as HTMLInputElement;
  expect(inputElement.value).toBe('Genre 125');

  await user.click(input);
  await expect
    .element(page.getByRole('option', { name: 'Genre 125' }))
    .toBeInTheDocument();

  await user.click(page.getByRole('option', { name: 'Genre 124' }));
  expect(inputElement.value).toBe('Genre 124');
});
