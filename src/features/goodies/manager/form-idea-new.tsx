import { zodResolver } from '@hookform/resolvers/zod';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { GiftIcon } from 'lucide-react';
import { useForm, useFormContext } from 'react-hook-form';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { PreventNavigation } from '@/components/prevent-navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  FormFieldsIdea,
  GOODIE_CATEGORY_OPTIONS,
  zFormFieldsIdea,
} from '../schema';

const FormGoodieIdea = () => {
  const form = useFormContext<FormFieldsIdea>();

  const categoriesGet = GOODIE_CATEGORY_OPTIONS.map((c) => ({
    id: c,
    label: c,
  }));

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Nom de l'idée</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Catégorie</FormFieldLabel>
        <FormFieldController
          type="select"
          control={form.control}
          name="category"
          options={categoriesGet}
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Description de l'idée</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="description"
        />
      </FormField>
    </div>
  );
};

export const FormIdeaNew = () => {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsIdea()),
    defaultValues: {
      name: '',
      category: 'TSHIRT',
      description: '',
    },
  });

  const goodieIdeaCreate = useMutation(
    orpc.idea.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.idea.getAll.key(),
          type: 'all',
        });

        form.reset();
      },
      onError: (err) => {
        console.error(err);
      },
    })
  );

  const goodieIdeaList = useInfiniteQuery(
    orpc.idea.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form {...form} onSubmit={(values) => goodieIdeaCreate.mutate(values)}>
        <div className="flex flex-col gap-4">
          Ajouter une nouvelle idée :
          <div className="flex flex-col gap-4 xs:flex-row">
            <div className="flex-2">
              <Card>
                <CardContent>
                  <FormGoodieIdea />
                </CardContent>
              </Card>
            </div>

            <div
              aria-hidden
              className="mx-auto w-full max-w-64 min-w-48 flex-1"
            >
              <GiftIcon />
            </div>
          </div>
          <Button
            type="submit"
            loading={goodieIdeaCreate.isPending}
            className="w-full"
          >
            + Ajouter l’idée
          </Button>
          <div className="mt-2 flex flex-col gap-3">
            <div className="text-md font-medium">Liste des idées :</div>

            {goodieIdeaList.isPending ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : goodieIdeaList.isError ? (
              <div className="text-sm text-destructive">
                Impossible de charger la liste.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {goodieIdeaList.data?.pages
                    .flatMap((p) => p.items)
                    .map((idea) => (
                      <Card key={idea.id}>
                        <CardContent className="flex flex-col gap-1">
                          <div className="font-medium">{idea.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {idea.category}
                          </div>
                          {idea.description ? (
                            <div className="text-sm">{idea.description}</div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    !goodieIdeaList.hasNextPage ||
                    goodieIdeaList.isFetchingNextPage
                  }
                  onClick={() => goodieIdeaList.fetchNextPage()}
                  className="w-full"
                >
                  {goodieIdeaList.isFetchingNextPage
                    ? 'Chargement…'
                    : goodieIdeaList.hasNextPage
                      ? 'Charger plus'
                      : 'Tout est chargé'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Form>
    </>
  );
};
