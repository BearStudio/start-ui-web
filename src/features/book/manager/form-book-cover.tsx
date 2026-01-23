import { useQuery } from '@tanstack/react-query';
import { Trash2Icon } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { join } from 'remeda';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldError,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { UploadButton } from '@/components/upload/upload-button';

import { envClient } from '@/env/client';
import { BookCover } from '@/features/book/book-cover';
import {
  bookCoverAcceptedFileTypes,
  FormFieldsBook,
} from '@/features/book/schema';
import { openDemoModeDrawer } from '@/features/demo/demo-mode-drawer';

export const FormBookCover = () => {
  const { t } = useTranslation(['book']);
  const form = useFormContext<FormFieldsBook>();
  const genresQuery = useQuery(orpc.genre.getAll.queryOptions());
  const title = useWatch({
    name: 'title',
    control: form.control,
  });
  const genreId = useWatch({
    name: 'genreId',
    control: form.control,
  });
  const author = useWatch({
    name: 'author',
    control: form.control,
  });
  const coverId = useWatch({
    name: 'coverId',
    control: form.control,
  });

  const genre = genresQuery.data?.items.find((item) => item.id === genreId);

  return (
    <FormField>
      <FormFieldController
        control={form.control}
        type="custom"
        name="coverId"
        render={({ field }) => {
          return (
            <>
              <div className="relative mb-2">
                <span className="sr-only">{t('book:manager.uploadCover')}</span>
                <BookCover
                  className="opacity-60"
                  book={{
                    title,
                    author,
                    genre,
                    coverId,
                  }}
                />

                <div className="absolute top-1/2 left-1/2 flex -translate-1/2 gap-2">
                  <UploadButton
                    uploadRoute="bookCover"
                    inputProps={{
                      accept: join(bookCoverAcceptedFileTypes, ','),
                    }}
                    className="bg-black/50 text-white"
                    variant="ghost"
                    onSuccess={(file) => field.onChange(file.objectInfo.key)}
                    onError={() => {
                      if (envClient.VITE_IS_DEMO) {
                        openDemoModeDrawer();
                        return;
                      }
                      toast.error(t('book:manager.uploadErrors.failed'));
                    }}
                  />
                  {field.value && (
                    <Button
                      variant="ghost"
                      className="bg-black/50 text-white"
                      size="icon"
                      onClick={() => field.onChange(undefined)}
                    >
                      <Trash2Icon />
                    </Button>
                  )}
                </div>
              </div>
              <FormFieldError />
            </>
          );
        }}
      />
    </FormField>
  );
};
