import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldHelper,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

import { zFormFieldsBook } from '@/features/book/schema';

export const DialogNewBook = (props: PropsWithChildren) => {
  const { t } = useTranslation(['book', 'common']);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(zFormFieldsBook().pick({ title: true })),
    values: {
      title: '',
    },
  });

  const bookCreate = useMutation(
    orpc.book.autoGenerate.mutationOptions({
      onSuccess: (data) => {
        router.navigate({ to: '/manager/books/new', search: data });
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'METHOD_NOT_SUPPORTED'
        ) {
          toast.error(t('common:errors.openAiMissingApiKey'));
        } else {
          toast.error(t('book:manager.modalNew.generationError'));
        }
      },
    })
  );

  const formTitle = useWatch({ name: 'title', control: form.control });

  return (
    <ResponsiveDrawer>
      <ResponsiveDrawerTrigger asChild>
        {props.children}
      </ResponsiveDrawerTrigger>
      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={async (values) => {
            bookCreate.mutate(values);
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('book:manager.modalNew.title')}
            </ResponsiveDrawerTitle>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel>{t('book:common.title.label')}</FormFieldLabel>
              <FormFieldController
                type="text"
                control={form.control}
                name="title"
                autoFocus
              />
              <FormFieldHelper>
                <Button variant="link" size="sm" asChild>
                  <Link
                    to="/manager/books/new"
                    search={{ title: formTitle ?? '' }}
                  >
                    {t('book:manager.modalNew.manualButton.label')}
                  </Link>
                </Button>
              </FormFieldHelper>
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose asChild>
              <Button variant="secondary">
                {t('book:manager.modalNew.cancelButton.label')}
              </Button>
            </ResponsiveDrawerClose>
            <Button type="submit" loading={bookCreate.isPending}>
              {t('book:manager.modalNew.createButton.label')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
