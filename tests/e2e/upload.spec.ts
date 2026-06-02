import { expect, test } from '@tests/e2e/utils';
import { ADMIN_FILE } from '@tests/e2e/utils/constants';

import { DEFAULT_LANGUAGE_KEY } from '@/platform/lib/i18n/constants';

import locales from '@/app/i18n';

const t = locales[DEFAULT_LANGUAGE_KEY];

type UploadFileRequest = { name: string; size: number; type: string };

type UploadInitRequest = {
  files: [UploadFileRequest, ...Array<UploadFileRequest>];
  route?: string;
};

test.describe('Book cover uploads', () => {
  test.use({ storageState: ADMIN_FILE });

  test('uploads a cover and keeps the book form recoverable after clearing it', async ({
    page,
  }) => {
    let uploadRequest: UploadInitRequest | undefined;

    await page.route('**/api/upload', async (route) => {
      uploadRequest = route.request().postDataJSON() as UploadInitRequest;
      const [file] = uploadRequest.files;

      await route.fulfill({
        body: JSON.stringify({
          files: [
            {
              file: {
                name: file.name,
                objectInfo: {
                  key: 'books/e2e-cover.webp',
                  metadata: {},
                },
                size: file.size,
                type: file.type,
              },
              headers: {},
              signedUrl: 'http://localhost:3000/__mock-upload',
              skip: 'completed',
            },
          ],
          metadata: {},
        }),
        contentType: 'application/json',
        status: 200,
      });
    });
    await page.route('**/books/e2e-cover.webp', async (route) => {
      await route.fulfill({
        body: Buffer.from(
          'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
          'base64'
        ),
        contentType: 'image/webp',
        status: 200,
      });
    });

    await page.goto('/manager/books/new', { waitUntil: 'commit' });

    await expect(page.getByText(t.book.manager.new.title)).toBeVisible();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page
      .getByRole('button', { name: t.components.uploadInput.placeholder })
      .click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles({
      name: 'cover.webp',
      mimeType: 'image/webp',
      buffer: Buffer.from('mock image bytes'),
    });

    await expect(page.getByText('cover.webp')).toBeVisible();
    await expect
      .poll(() => uploadRequest)
      .toMatchObject({
        files: [
          expect.objectContaining({ name: 'cover.webp', type: 'image/webp' }),
        ],
        route: 'bookCover',
      });

    await page
      .getByRole('button', {
        exact: true,
        name: t.components.uploadInput.removeFile,
      })
      .click();

    await expect(
      page.getByText(t.components.uploadInput.placeholder)
    ).toBeVisible();
    await page.getByLabel(t.book.common.title.label).fill('Upload Recovery');
    await expect(page.getByLabel(t.book.common.title.label)).toHaveValue(
      'Upload Recovery'
    );
  });
});
