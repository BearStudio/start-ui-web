import { zodResolver } from '@hookform/resolvers/zod';
import { ORPCError } from '@orpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBlocker, useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FormBook } from '@/features/book/manager/form-book';
import { FormBookCover } from '@/features/book/manager/form-book-cover';
import { zFormFieldsBook } from '@/features/book/schema';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageBookUpdate = (props: { params: { id: string } }) => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const bookQuery = useQuery(
    orpc.book.getById.queryOptions({ input: { id: props.params.id } })
  );
  const form = useForm({
    resolver: zodResolver(zFormFieldsBook()),
    values: {
      id: bookQuery.data?.id ?? '',
      title: bookQuery.data?.title ?? '',
      author: bookQuery.data?.author ?? '',
      genreId: bookQuery.data?.genre?.id ?? null!,
      publisher: bookQuery.data?.publisher ?? '',
    },
  });

  const bookUpdate = useMutation(
    orpc.book.updateById.mutationOptions({
      onSuccess: async () => {
        // Invalidate Users list
        await queryClient.invalidateQueries({
          queryKey: orpc.book.getAll.key(),
          type: 'all',
        });

        // Redirect
        if (canGoBack) {
          router.history.back();
        } else {
          router.navigate({ to: '..', replace: true });
        }
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data?.target?.includes('title')
        ) {
          form.setError('title', {
            message: 'A book by this author already exist',
          });
          return;
        }

        toast.error('Failed to update the book');
      },
    })
  );

  const formIsDirty = form.formState.isDirty;
  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty || bookUpdate.isSuccess) return false;
      const shouldLeave = confirm('Are you sure you want to leave?');
      return !shouldLeave;
    },
  });

  return (
    <Form
      {...form}
      onSubmit={async (values) => {
        bookUpdate.mutate(values);
      }}
    >
      <PageLayout>
        <PageLayoutTopBar
          backButton={<BackButton />}
          actions={
            <Button
              size="sm"
              type="submit"
              className="min-w-20"
              loading={bookUpdate.isPending}
            >
              Update
            </Button>
          }
        >
          <PageLayoutTopBarTitle>Update Book</PageLayoutTopBarTitle>
        </PageLayoutTopBar>
        <PageLayoutContent>
          <div className="flex flex-col gap-4 xs:flex-row">
            <div className="flex-2">
              <Card>
                <CardContent>
                  <FormBook />
                </CardContent>
              </Card>
            </div>
            <div
              aria-hidden
              className="mx-auto w-full max-w-64 min-w-48 flex-1"
            >
              <FormBookCover />
            </div>
          </div>
        </PageLayoutContent>
      </PageLayout>
    </Form>
  );
};
